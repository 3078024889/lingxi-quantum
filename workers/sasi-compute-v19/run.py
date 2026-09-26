import os
# Offline at inference time, including all transitive Hugging Face loaders.
os.environ["HF_HUB_OFFLINE"]="1"
os.environ["TRANSFORMERS_OFFLINE"]="1"
os.environ["HF_HUB_DISABLE_TELEMETRY"]="1"
from dotenv import load_dotenv
load_dotenv()
import uvicorn
if __name__=="__main__":
    uvicorn.run("sasi_worker.server:app",host=os.getenv("SASI_BIND_HOST","127.0.0.1"),port=8787,log_level="info",workers=1)
