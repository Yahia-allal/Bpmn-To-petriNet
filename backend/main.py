from fastapi import FastAPI, UploadFile, File
from fastapi.responses import StreamingResponse, JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
import uuid
import pm4py
from pm4py.objects.bpmn.importer import importer as bpmn_importer
from pm4py.convert import convert_to_petri_net
from pm4py.objects.petri_net.exporter import exporter as pnml_exporter
import tempfile

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
RESULT_DIR = "results"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(RESULT_DIR, exist_ok=True)

uploaded_files = {}

def convert_bpmn_to_pnml(bpmn_file_path):
    temp_dir = tempfile.mkdtemp()
    bpmn_filepath = os.path.join(temp_dir, "uploaded.bpmn")
    shutil.copy(bpmn_file_path, bpmn_filepath)
    bpmn_graph = bpmn_importer.apply(bpmn_filepath)
    net, im, fm = convert_to_petri_net(bpmn_graph)

    pnml_filepath = os.path.join(temp_dir, "converted_petri_net.pnml")
    pnml_exporter.apply(net, im, pnml_filepath)
    return pnml_filepath

@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    file_id = uuid.uuid4().hex
    bpmn_path = os.path.join(UPLOAD_DIR, f"{file_id}_{file.filename}")
    with open(bpmn_path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    uploaded_files[file_id] = {"path": bpmn_path, "original_name": file.filename}
    return {"id": file_id, "filename": file.filename}

@app.get("/download-net/{file_id}")
async def download_net(file_id: str):
    if file_id not in uploaded_files:
        return JSONResponse({"error": "File not found"}, status_code=404)
    bpmn_path = uploaded_files[file_id]["path"]
    pnml_filepath = convert_bpmn_to_pnml(bpmn_path)
    # Nom personnalisé
    out_name = uploaded_files[file_id]["original_name"].replace('.bpmn', '.pnml')
    return FileResponse(
        pnml_filepath,
        media_type="application/xml",
        filename=f"conversion_{out_name}"
    )

@app.get("/draw-petri/{file_id}")
async def draw_petri(file_id: str):
    if file_id not in uploaded_files:
        return JSONResponse({"error": "File not found"}, status_code=404)
    bpmn_path = uploaded_files[file_id]["path"]
    bpmn_graph = pm4py.read_bpmn(bpmn_path)
    petri_net, initial_marking, final_marking = pm4py.convert_to_petri_net(bpmn_graph)

    image_file = f"petri_{uuid.uuid4().hex}.png"
    image_path = os.path.join(RESULT_DIR, image_file)
    pm4py.save_vis_petri_net(petri_net, initial_marking, final_marking, image_path)
    return JSONResponse({"image_url": f"http://localhost:8000/petri-image/{image_file}"})

@app.get("/petri-image/{filename}")
async def get_petri_image(filename: str):
    path = os.path.join(RESULT_DIR, filename)
    return StreamingResponse(open(path, "rb"), media_type="image/png")
