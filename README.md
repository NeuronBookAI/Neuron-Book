# 🧠 Neuron Book
Website: https://neuron-book.base44.app
Demo: https://neuron-book-6198.d.kiloapps.io

This is the full-stack application featuring a **Next.js** frontend and a **Flask** backend, designed to run concurrently during development.

---

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or later)
- **Python** (3.8 or later)
- **npm** (comes with Node.js)

---

## 🏃 Getting Started

Follow these steps to set up the project locally:

### 1. Clone the Repository

```bash
git clone https://github.com/NeuronBookAI/neuron-book.git
cd neuron-book
```

### 2. Install Frontend Dependencies

```bash
npm i
```

### 3. Set Up the Python Backend

```bash
# Move to api directory
cd api

# Create a virtual environment
python3 -m venv .venv

# Activate the environment
# On macOS/Linux:
. .venv/bin/activate

# On Windows:
# .venv\Scripts\activate

# Install Python requirements
pip install -r requirements.txt

# Return to the root directory
cd ..
```

### 4. Run Development

```bash
npm run dev
```

The application will be available at:
Frontend: <http://localhost:3000>
Backend API: <http://localhost:5328/api>

### 5. Make a branch to work on your own feature or fix

Use the following format:

- your-username/feature-name
- Example: gmatt20/neural-trace

```bash
# Create and switch to a new branch
git checkout -b your-username/feature-name

# Example
git checkout -b gmatt20/neural-trace
```

### 6. Pushing & Pulling

Push your changes:

```bash
git add .
git commit -m "feat: implement socratic decay logic"
git push origin your-username/feature-name
```

Then create your PR in GitHub
