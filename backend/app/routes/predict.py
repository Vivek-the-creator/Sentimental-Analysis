from fastapi import APIRouter
from app.schemas.schemas import PredictRequest, PredictResponse
from app.services.ml_service import predict_sentiment

router = APIRouter(prefix="/api", tags=["ML"])


@router.post("/predict", response_model=PredictResponse)
def predict(request: PredictRequest):
    sentiment = predict_sentiment(request.text)
    return {"sentiment": sentiment}
