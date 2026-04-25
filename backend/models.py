"""
Smart Traffic Prediction System — Model Definitions
=====================================================
Four deep-learning architectures for traffic volume forecasting.
"""

from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import (
    LSTM, GRU, Dense, Dropout, BatchNormalization, Bidirectional, Input
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


MODEL_BUILDERS = {
    'LSTM':           build_lstm,
    'Stacked_LSTM':   build_stacked_lstm,
    'Bidirectional_LSTM': build_bilstm,
    'GRU':            build_gru,
}
