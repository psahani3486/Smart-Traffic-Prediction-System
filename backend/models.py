"""
Smart Traffic Prediction System — Model Definitions
=====================================================
Four deep-learning architectures for traffic volume forecasting.
"""

from keras.models import Sequential
from keras.layers import (
    LSTM, GRU, Dense, Dropout, BatchNormalization, Bidirectional, Input,
    Conv1D, GlobalMaxPooling1D, Flatten
)


def build_lstm(input_shape, name='LSTM_Basic'):
    """Single-layer LSTM (baseline)."""
    model = Sequential(name=name)
    model.add(Input(shape=input_shape))
    model.add(LSTM(64, return_sequences=False))
    model.add(BatchNormalization())
    model.add(Dropout(0.2))
    model.add(Dense(32, activation='relu'))
    model.add(Dense(1))
    return model


def build_stacked_lstm(input_shape, name='Stacked_LSTM'):
    """3-layer deep LSTM with progressive dropout."""
    model = Sequential(name=name)
    model.add(Input(shape=input_shape))
    model.add(LSTM(128, return_sequences=True))
    model.add(BatchNormalization())
    model.add(Dropout(0.2))
    model.add(LSTM(64, return_sequences=True))
    model.add(BatchNormalization())
    model.add(Dropout(0.25))
    model.add(LSTM(32, return_sequences=False))
    model.add(BatchNormalization())
    model.add(Dropout(0.3))
    model.add(Dense(32, activation='relu'))
    model.add(Dense(1))
    return model


def build_bilstm(input_shape, name='Bidirectional_LSTM'):
    """Bidirectional LSTM for richer temporal representation."""
    model = Sequential(name=name)
    model.add(Input(shape=input_shape))
    model.add(Bidirectional(LSTM(64, return_sequences=True)))
    model.add(BatchNormalization())
    model.add(Dropout(0.2))
    model.add(Bidirectional(LSTM(32, return_sequences=False)))
    model.add(BatchNormalization())
    model.add(Dropout(0.25))
    model.add(Dense(32, activation='relu'))
    model.add(Dense(1))
    return model


def build_gru(input_shape, name='GRU_Model'):
    """GRU — lighter alternative to LSTM."""
    model = Sequential(name=name)
    model.add(Input(shape=input_shape))
    model.add(GRU(128, return_sequences=True))
    model.add(BatchNormalization())
    model.add(Dropout(0.2))
    model.add(GRU(64, return_sequences=False))
    model.add(BatchNormalization())
    model.add(Dropout(0.25))
    model.add(Dense(32, activation='relu'))
    model.add(Dense(1))
    return model


def build_cnn_1d(input_shape, name='CNN_1D'):
    """1D CNN for fast feature extraction over time steps."""
    model = Sequential(name=name)
    model.add(Input(shape=input_shape))
    model.add(Conv1D(filters=64, kernel_size=3, activation='relu', padding='same'))
    model.add(BatchNormalization())
    model.add(Dropout(0.2))
    model.add(Conv1D(filters=32, kernel_size=3, activation='relu', padding='same'))
    model.add(GlobalMaxPooling1D())
    model.add(Dense(32, activation='relu'))
    model.add(Dense(1))
    return model


def build_cnn_lstm(input_shape, name='CNN_LSTM_Hybrid'):
    """CNN-LSTM hybrid mapping spatial-temporal features."""
    model = Sequential(name=name)
    model.add(Input(shape=input_shape))
    model.add(Conv1D(filters=64, kernel_size=3, activation='relu', padding='same'))
    model.add(BatchNormalization())
    model.add(Dropout(0.2))
    model.add(LSTM(64, return_sequences=False))
    model.add(Dropout(0.2))
    model.add(Dense(32, activation='relu'))
    model.add(Dense(1))
    return model


MODEL_BUILDERS = {
    'LSTM':           build_lstm,
    'Stacked_LSTM':   build_stacked_lstm,
    'Bidirectional_LSTM': build_bilstm,
    'GRU':            build_gru,
    'CNN_1D':         build_cnn_1d,
    'CNN_LSTM':       build_cnn_lstm,
}
