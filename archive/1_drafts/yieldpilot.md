# YieldPilot - Vision‑Guided Cut Routing & Grade Optimization

## Problem
Yield loss from mis‑graded cuts; operators can't see global optimum.

## MVP
* Image set of poultry cuts (synthetic or stock)
* Simple classifier (pretrained backbone) to assign grade
* Rule-based router assigns to best‑margin SKU given order mix
* Dashboard shows **yield uplift vs. baseline**

## KPIs
* % correct grade
* Theoretical yield gain
* Margin per hour (simulated)

## Implementation Notes
- Use existing pretrained models for image classification
- Create synthetic dataset of poultry cuts with different grades
- Implement routing algorithm based on margin optimization
- Build dashboard to visualize yield improvements