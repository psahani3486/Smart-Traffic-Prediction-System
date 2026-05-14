import os
import tensorflow as tf

# Path to the best model
SAVE_DIR = 'saved_models'
model_path = os.path.join(SAVE_DIR, 'DNN_Basic.keras')
tflite_path = os.path.join(SAVE_DIR, 'DNN_Basic.tflite')

if os.path.exists(model_path):
    print(f"Loading model from {model_path}...")
    model = tf.keras.models.load_model(model_path)
    
    print("Converting model to TFLite...")
    converter = tf.lite.TFLiteConverter.from_keras_model(model)
    tflite_model = converter.convert()
    
    print(f"Saving TFLite model to {tflite_path}...")
    with open(tflite_path, 'wb') as f:
        f.write(tflite_model)
    print("Conversion complete!")
else:
    print(f"Model file {model_path} not found.")
