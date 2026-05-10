"""
Smart Traffic Prediction System — Model Definitions
=====================================================
Deep learning architectures for tabular data regression.
"""

from keras.models import Sequential
from keras.layers import Dense, Dropout, BatchNormalization, Input

def build_dnn_basic(input_shape, name='DNN_Basic'):
    """Simple 2-layer Neural Network."""
    model = Sequential(name=name)
    model.add(Input(shape=input_shape))
    model.add(Dense(64, activation='relu'))
    model.add(BatchNormalization())
    model.add(Dense(32, activation='relu'))
    model.add(Dense(1)) # Predicting speed
    return model

def build_dnn_deep(input_shape, name='DNN_Deep'):
    """Deeper Neural Network for capturing complex non-linearities."""
    model = Sequential(name=name)
    model.add(Input(shape=input_shape))
    model.add(Dense(128, activation='relu'))
    model.add(BatchNormalization())
    model.add(Dropout(0.2))
    model.add(Dense(64, activation='relu'))
    model.add(BatchNormalization())
    model.add(Dropout(0.2))
    model.add(Dense(32, activation='relu'))
    model.add(Dense(1))
    return model

def build_dnn_wide(input_shape, name='DNN_Wide'):
    """Wide Neural Network."""
    model = Sequential(name=name)
    model.add(Input(shape=input_shape))
    model.add(Dense(256, activation='relu'))
    model.add(BatchNormalization())
    model.add(Dropout(0.3))
    model.add(Dense(64, activation='relu'))
    model.add(Dense(1))
    return model

def build_dnn_dropout(input_shape, name='DNN_HeavyDropout'):
    """Model with heavy dropout to prevent overfitting on categorical encodings."""
    model = Sequential(name=name)
    model.add(Input(shape=input_shape))
    model.add(Dense(128, activation='relu'))
    model.add(BatchNormalization())
    model.add(Dropout(0.4))
    model.add(Dense(64, activation='relu'))
    model.add(BatchNormalization())
    model.add(Dropout(0.3))
    model.add(Dense(32, activation='relu'))
    model.add(Dropout(0.2))
    model.add(Dense(1))
    return model

MODEL_BUILDERS = {
    'DNN_Basic': build_dnn_basic,
    'DNN_Deep': build_dnn_deep,
    'DNN_Wide': build_dnn_wide,
    'DNN_HeavyDropout': build_dnn_dropout,
}
