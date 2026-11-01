/** Evidence-backed task outcomes for developer and local-first products. */
export const PRODUCT_STRENGTHS:Readonly<Record<string,{text:string;source:string}>>={
 'anthropic-sdk-python':{text:'官方 Python SDK：使用 Python 调用 Claude API，支持同步、异步和流式调用；API 按模型另计费。',source:'https://platform.claude.com/docs/en/cli-sdks-libraries/sdks/python'},
 dify:{text:'通过可视化工作流、知识库和智能体把模型能力组合成可部署的 AI 应用。',source:'https://www.dify.ai/'},
 fasterwhisper:{text:'使用 CTranslate2 执行 Whisper 语音识别，可在支持的设备上优化推理性能。',source:'https://github.com/SYSTRAN/faster-whisper'},
 langchain:{text:'将模型、工具、检索和智能体步骤编排到应用中，适合开发和自动化集成。',source:'https://www.langchain.com/langchain'},
 llamacpp:{text:'本地运行量化大语言模型，支持多种 CPU/GPU 后端；速度取决于设备与具体模型。',source:'https://github.com/ggml-org/llama.cpp'},
 llamaindex:{text:'解析文档并构建检索增强生成与知识问答流程，模型与托管费用分别计算。',source:'https://www.llamaindex.ai/'},
 n8n:{text:'连接应用与 API 的可视化工作流，也可编排需要人工审核的 AI 智能体。',source:'https://n8n.io/'},
 openwebui:{text:'自托管 AI 聊天工作台，可对接本地和远程模型；模型费用取决于后端。',source:'https://docs.openwebui.com/'},
 'openai-python':{text:'OpenAI 官方 Python SDK：以代码调用模型、工具与流式接口；API 使用按调用计费。',source:'https://developers.openai.com/api/docs/libraries'},
 automatic1111:{text:'提供 Stable Diffusion 的本地网页图像生成界面，支持扩展、批量生成和参数控制。',source:'https://github.com/AUTOMATIC1111/stable-diffusion-webui'},
 transformers:{text:'Hugging Face 模型生态的 Python 库，可加载模型用于推理或训练，计算成本来自执行环境。',source:'https://huggingface.co/docs/transformers/en/index'},
 vllm:{text:'面向大模型服务部署和高吞吐推理，适合自建 API 服务而非零配置网页聊天。',source:'https://docs.vllm.ai/en/latest/'},
 whisper:{text:'OpenAI 开源的多语言语音识别与翻译模型，适合音频转文字和字幕工作流。',source:'https://github.com/openai/whisper'},
};
