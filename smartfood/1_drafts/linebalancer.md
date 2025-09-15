# LineBalanceR - Dynamic Line & Staffing Balancer

## Problem
Bottlenecks shift with SKU mix; staffing is static.

## MVP
* Discrete-event **sim** (Python) of a cut/pack line with adjustable cycle times
* Simple optimizer recommends **station staffing** and **buffer sizes**
* Upload a CSV of orders → get a **line setup** and predicted OEE

## KPIs
* Throughput delta
* WIP minutes
* Overtime avoided

## Demo Features
* Slide the order mix → see stations/people and predicted OEE update live
* "Autonomous factory" narrative + easy BRAINR export: **recommended schedule**

## Why It's Hackable
* No plant data needed - can simulate everything
* Shows autonomous ops narrative
* Quick to prototype with discrete event simulation