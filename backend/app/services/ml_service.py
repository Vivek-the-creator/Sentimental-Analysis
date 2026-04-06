import logging
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification

logger = logging.getLogger(__name__)


class MLService:
    """Singleton BERT sentiment classifier."""

    def __init__(self):
        self.tokenizer = None
        self.model = None
        self.labels: dict = {}
        self._loaded = False

    def load_model(self):
        if self._loaded:
            return
        from app.core.config import settings
        model_path = settings.MODEL_PATH
        logger.info(f"Loading BERT model from: {model_path}")
        try:
            self.tokenizer = AutoTokenizer.from_pretrained(model_path)
            self.model = AutoModelForSequenceClassification.from_pretrained(model_path)
            self.model.eval()
            if hasattr(self.model.config, "id2label") and self.model.config.id2label:
                self.labels = self.model.config.id2label
            else:
                self.labels = {0: "Negative", 1: "Neutral", 2: "Positive"}
            self._loaded = True
            logger.info(f"Model loaded. Labels: {self.labels}")
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            raise

    def predict(self, text: str) -> str:
        if not self._loaded:
            self.load_model()
        inputs = self.tokenizer(
            text,
            return_tensors="pt",
            truncation=True,
            padding=True,
            max_length=512,
        )
        with torch.no_grad():
            outputs = self.model(**inputs)
        predicted_class = int(torch.argmax(outputs.logits, dim=-1).item())
        raw_label = str(self.labels.get(predicted_class, "Neutral")).lower()

        if "positive" in raw_label or raw_label in ["pos", "1", "label_2"]:
            return "Positive"
        elif "negative" in raw_label or raw_label in ["neg", "0", "label_0"]:
            return "Negative"
        else:
            return "Neutral"


# Module-level singleton — loaded once at app startup
ml_service = MLService()


def predict_sentiment(text: str) -> str:
    return ml_service.predict(text)
