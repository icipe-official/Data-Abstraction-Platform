#!/bin/bash

npm run build

docker build -t icipe/dap/frontend_web:latest .