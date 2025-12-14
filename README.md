<p align="center">
  <img src="https://img.shields.io/badge/Python-3.8%2B-blue.svg" />
  <img src="https://img.shields.io/badge/PyTorch-2.0+-ee4c2c.svg" />
  <img src="https://img.shields.io/badge/License-MIT-green.svg" />
  <img src="https://img.shields.io/badge/API-Flask-lightgrey.svg" />
  <img src="https://img.shields.io/badge/Deployment-Ngrok-blueviolet.svg" />
  <img src="https://img.shields.io/badge/Dataset-PhysioNet-orange.svg" />
</p>
## Abstract

Sleep apnea is a prevalent sleep disorder associated with severe cardiovascular
and neurological complications if left undiagnosed. Conventional diagnostic
methods such as polysomnography are costly, intrusive, and unsuitable for
long-term or continuous monitoring. This work presents an automated sleep apnea
detection framework using single-lead electrocardiogram (ECG) signals, enabling
deployment in wearable and resource-constrained environments.

The proposed approach leverages transfer learning from the Electrocardiogram
Signal Intelligence (ESI) foundation model, pre-trained on large-scale 12-lead
ECG data. A learnable lead projection module maps single-lead ECG signals to a
synthetic 12-lead representation, allowing effective reuse of the pre-trained
backbone. Temporal dependencies are modeled using a bidirectional long
short-term memory (BiLSTM) network with an attention mechanism, followed by
multi-scale pooling and a lightweight classifier.

Experimental evaluation on the PhysioNet Apnea-ECG database demonstrates strong
performance, achieving an ROC-AUC of 0.921 and an accuracy of 87.3%. The proposed
system is deployed as a real-time RESTful API, highlighting its practicality
for clinical screening and continuous home-based sleep monitoring.


## ✨ Key Features

- **Single-Lead ECG Input**  
  Designed for wearable and portable devices with minimal hardware requirements.

- **Transfer Learning with ESI Foundation Model**  
  Utilizes a ConvNeXt-based ECG foundation model pre-trained on large-scale
  12-lead ECG data to improve generalization and data efficiency.

- **Learnable Lead Projection**  
  Projects single-lead ECG signals into a synthetic 12-lead representation,
  enabling effective reuse of multi-lead pre-trained models.

- **Temporal Modeling with Attention**  
  Captures long-range temporal dependencies using a bidirectional LSTM with
  attention to highlight apnea-relevant ECG segments.

- **Robust Preprocessing & Augmentation**  
  Includes outlier filtering, normalization, noise injection, amplitude scaling,
  and baseline wander simulation.

- **Production-Ready Deployment**  
  Real-time inference via a Flask-based REST API with Ngrok support.

- **Interpretable Outputs**  
  Provides confidence scores and risk levels alongside binary predictions.

## 📊 Dataset

This project uses the **PhysioNet Apnea-ECG Database**, a widely adopted benchmark
dataset for sleep apnea research.

- **Number of Subjects:** 70
- **Sampling Frequency:** 100 Hz
- **Recording Duration:** ~8 hours per subject
- **Labels:** Per-minute annotations (A = Apnea, N = Normal)

### Data Split
- Training: 70%
- Validation: 10%
- Testing: 20%

Stratified splitting is used to maintain balanced class distribution across all
sets.
