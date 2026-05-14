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
    
    print("Converting model to ONNX (using functional API)...")
    # Wrap the model in a function for better conversion
    @tf.function(input_signature=[tf.TensorSpec([None, model.input_shape[1]], tf.float32, name="input")])
    def predict_fn(x):
        return model(x)
        
    model_proto, _ = tf2onnx.convert.from_function(predict_fn, input_signature=[tf.TensorSpec([None, model.input_shape[1]], tf.float32, name="input")], opset=13)
    
    print(f"Saving ONNX model to {onnx_path}...")
    onnx.save(model_proto, onnx_path)
    print("Conversion complete!")
else:
    print(f"Model file {model_path} not found.")
