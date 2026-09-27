import uvicorn
from sasi_worker.server import app

if __name__=="__main__":
    uvicorn.run(app,host="0.0.0.0",port=8787,log_level="info")
