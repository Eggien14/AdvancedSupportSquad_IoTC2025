from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import Response, JSONResponse
from contextlib import asynccontextmanager

from . import config
from . import state
from .object_detect import start_all_detectors

@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.detector_threads = start_all_detectors()  # startup
    yield                                             # shutdown: daemon threads auto-exit

app = FastAPI(title="detector", version="1.0.0", lifespan=lifespan)

@app.get("/healthz")
def healthz():
    return {"status": "ok"}

@app.get("/image")
def image(cart_id: int = Query(..., description="Cart ID")):
    data = state.get_latest_jpeg(cart_id)
    if data is None:
        raise HTTPException(status_code=404, detail="Image not found")
    return Response(data, media_type="image/jpeg", headers={"Cache-Control": "no-store"})

@app.get("/inventory")
def inventory(cart_id: int = Query(..., description="Cart ID")):
    return JSONResponse(state.get_inventory(cart_id))
