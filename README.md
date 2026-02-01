# ⚡ Custom Code Execution Engine

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/Tech-Node.js-green.svg)
![Docker](https://img.shields.io/badge/Tech-Docker-blue.svg)
![Kubernetes](https://img.shields.io/badge/Tech-Kubernetes-blue.svg)
![Monitoring](https://img.shields.io/badge/Monitoring-Grafana%20%2B%20Prometheus-orange.svg)

## 👋 Hello! What is this?
Imagine a website where you can type Python or Java code, click a "Run" button, and see the result instantly. That's what this project is! 

It's like having a coding playground (like LeetCode or Replit) running on your own computer.

---

## 🚦 Step-by-Step Guide (How to Run It)

Follow these exact steps to get it running in 5 minutes.

### Step 1: Install the Tools 🛠️
Before you start, you need two things installed on your computer. If you don't have them, download and install them now:

1.  **Docker Desktop** (Required)
    *   Download here: [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)
    *   *Install it and make sure it is running (you should see a little whale icon).*
2.  **Node.js** (Required)
    *   Download here: [https://nodejs.org/](https://nodejs.org/)
    *   *Just download the "LTS" version and click Next -> Next -> Finish.*

### Step 2: Open the Project 📂
1.  Open your **Terminal** (Command Prompt or PowerShell).
2.  Check if you are in the project folder `code-execution-engine`.

### Step 3: Start the Engine (The Magic Command) ✨
Copy and paste this *entire* command into your terminal and hit **Enter**:

```bash
docker-compose -f docker-compose.monitoring.yml up -d --build
```

*Wait for about 1-2 minutes while it downloads everything. It will verify that "Containers" are "Started".*

### Step 4: Open in Your Browser 🌐
Once the command finishes, open these links in Chrome or Edge:

*   **👉 The Code Editor (Your App):** [http://localhost:3000](http://localhost:3000)
    *   *Go here to write and run code!*
*   **📊 The Monitoring Dashboard:** [http://localhost:3001](http://localhost:3001)
    *   *Username: `admin`*
    *   *Password: `admin`*
    *   *Go here to see cool graphs of your server running.*

---

## 🛑 How to Stop It
When you are done, don't just close the terminal! You should stop the engine properly to save battery and memory.

1.  Go back to your terminal.
2.  Run this "Stop" command:

```bash
docker-compose -f docker-compose.monitoring.yml down
```

That's it! Everything is clean now. 🧹

---

## 🤓 For Experts Only (Technical details)

If you are a developer or recruiter, here is the technical summary:

*   **Architecture**: Node.js API with Docker-based sandboxing.
*   **Security**: Code runs in isolated containers with CPU/RAM limits and no network.
*   **Scalability**: Stateless architecture, ready for Kubernetes (manifests in `/k8s` folder).
*   **Observability**: Prometheus metrics scraping with Grafana visualization.

**Kubernetes Deployment:**
```bash
kubectl apply -f k8s/
# To stop: kubectl delete -f k8s/
```

**API Usage:**
`POST /api/execute` with `{ "language": "python", "code": "print('hi')" }`.

---

### Author
Built by **Joy Banerjee**
