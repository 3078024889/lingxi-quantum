"""Owned image bytes -> local vision processor -> local model. No URL fetching."""
import base64
import binascii
import io
import time
from .model_manager import MANAGER

MAX_IMAGE_BYTES=1024*1024
MAX_IMAGES=2

def decode_images(values):
    from PIL import Image, ImageOps
    if not isinstance(values,list) or not 1<=len(values)<=MAX_IMAGES:
        raise ValueError('VISION_IMAGE_COUNT')
    images=[]
    for value in values:
        if not isinstance(value,str) or len(value)>MAX_IMAGE_BYTES*4//3+200:
            raise ValueError('VISION_IMAGE_SIZE')
        header,sep,encoded=value.partition(',')
        if not sep or header not in ('data:image/jpeg;base64','data:image/png;base64','data:image/webp;base64'):
            raise ValueError('VISION_IMAGE_FORMAT')
        try: raw=base64.b64decode(encoded,validate=True)
        except (ValueError,binascii.Error): raise ValueError('VISION_IMAGE_ENCODING') from None
        if len(raw)>MAX_IMAGE_BYTES: raise ValueError('VISION_IMAGE_SIZE')
        try:
            with Image.open(io.BytesIO(raw)) as source:
                if source.format not in ('PNG','JPEG','WEBP') or source.width*source.height>16_000_000:
                    raise ValueError('VISION_IMAGE_DIMENSIONS')
                source.load()
                image=ImageOps.exif_transpose(source).convert('RGB')
                image.thumbnail((1536,1536))
                images.append(image)
        except (OSError,Image.DecompressionBombError): raise ValueError('VISION_IMAGE_INVALID') from None
    return images

def run_vision(model_id: str, data: dict):
    images=decode_images(data.get('images'))
    prompt=str(data.get('prompt','')).strip()
    if not prompt or len(prompt)>24000: raise ValueError('VISION_PROMPT_LENGTH')
    processor,model=MANAGER.load_vision(model_id)
    content=[{'type':'image'} for _ in images]+[{'type':'text','text':prompt}]
    messages=[{'role':'system','content':'Describe only what the supplied images support. State uncertainty; never invent unseen details.'},
              {'role':'user','content':content}]
    text=processor.apply_chat_template(messages,tokenize=False,add_generation_prompt=True)
    inputs=processor(text=[text],images=images,return_tensors='pt',padding=True).to(model.device)
    started=time.perf_counter()
    with MANAGER._torch().inference_mode():
        output=model.generate(**inputs,max_new_tokens=2048,do_sample=False)
    generated=output[:,inputs.input_ids.shape[1]:]
    answer=processor.batch_decode(generated,skip_special_tokens=True,clean_up_tokenization_spaces=False)[0].strip()
    if not answer: raise RuntimeError('MODEL_EMPTY_RESULT')
    return {'text':answer,'imageCount':len(images)},[],{'wallMs':int((time.perf_counter()-started)*1000)}
