import os
import tensorflow as tf
import tf2onnx
import onnx

# Path to the best model
SAVE_DIR = 'saved_models'
model_path = os.path.join(SAVE_DIR, 'DNN_Basic.keras')
onnx_path = os.path.join(SAVE_DIR, 'DNN_Basic.onnx')

if os.path.exists(model_path):
    print(f"Loading model from {model_path}...")
    model = tf.keras.models.load_model(model_path)
    
    # Specify input signature for conversion
    spec = (tf.TensorSpec((None, model.input_shape[1]), tf.float32, name="input"),)
    
    print("Converting model to ONNX...")
    model_proto, _ = tf2onnx.convert.from_keras(model, input_signature=spec, opset=13)
    
    print(f"Saving ONNX model to {onnx_path}...")
    onnx.save(model_proto, onnx_path)
    print("Conversion complete!")
else:
    print(f"Model file {model_path} not found.")
