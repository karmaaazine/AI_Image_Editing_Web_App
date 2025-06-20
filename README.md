# AI Image Editing Web App — Internship Project

This project is an individual assignment to build a basic full-stack web application that allows users to perform AI-powered image editing and generation using the Stability AI API.

**Deadline:** 7 days from project start.

## 🚀 Features Implemented

This application provides the following AI-powered image manipulation features:

1.  **Image Generation (Text-to-Image):** Generate new images from a text prompt.
2.  **Inpaint:** Modify specific areas of an image, filling them intelligently based on surrounding content or a new prompt.
3.  **Erase:** Remove unwanted objects or areas from an image.

**All three features are fully implemented and functional.**

## 🎯 Mandatory API Endpoint & Model Selection

* **Mandatory Inpaint API Endpoint:**
    `https://platform.stability.ai/docs/api-reference#tag/Edit/paths/~1v2beta~1stable-image~1edit~1inpaint/post`
* **Model Cost Requirement:** All features utilize Stability AI models that cost **0.3 credits per image**, ensuring cost-effective testing and operation.

## 📁 Project Structure

The project follows a clear separation of concerns with a dedicated frontend and backend:
├── frontend/             # React web application
├── backend/              # Python Flask API server
├── .env.example          # Example environment variables file
└── README.md             # This project documentation

## ⚙️ Installation & Running Locally

Follow these steps to set up and run the application on your local machine.

### Prerequisites

Before you begin, ensure you have the following installed:

* **Python 3.7+** and **pip**
* **Node.js** (LTS recommended) and **npm** (comes with Node.js)
* **Virtual environment** tool (like `venv` built into Python)
* **Vercel CLI** (optional, for deployment: `npm i -g vercel`)
* **Stability AI API key** with sufficient free credits.

### Steps

1.  **Clone the Repository:**

    ```bash
    git clone <your-repo-url>
    cd <project-folder> # Replace with your project's root folder name
    ```

2.  **Setup Environment Variables:**

    Copy the example environment file and add your Stability AI API key:

    ```bash
    cp .env.example .env
    ```

    Open the newly created `.env` file and add your API key:

    ```
    STABILITY_API_KEY="YOUR_STABILITY_AI_API_KEY_HERE"
    ```

3.  **Backend Setup (Python Flask):**

    Navigate into the `backend` directory, create a virtual environment, activate it, install dependencies, and start the Flask server.

    ```bash
    cd backend

    # Create and activate virtual environment (Linux/macOS)
    python3 -m venv venv
    source venv/bin/activate

    # Create and activate virtual environment (Windows)
    # python -m venv venv
    # .\venv\Scripts\activate

    pip install -r requirements.txt
    flask run
    # Or for development with auto-reloading: FLASK_DEBUG=1 flask run
    ```
    The backend server will typically run on `http://127.0.0.1:5000` by default.

4.  **Frontend Setup (React/Next.js):**

    Open a **new terminal window**, navigate into the `frontend` directory, install Node.js dependencies, and start the frontend development server.

    ```bash
    cd ../frontend # Go back to project root, then into frontend
    npm install
    npm start
    ```
    The frontend application will typically open in your browser at `http://localhost:3000` (or another port if 3000 is in use).

## 🚀 Deployment

Both the frontend and backend components of this application are designed for deployment on Vercel.

### Vercel Environment Variables

Ensure your `STABILITY_API_KEY` is securely configured as an environment variable in your Vercel project settings for both the frontend and backend deployments.

## Example of the Inpaint Tool

I gave the inpain tool an original photo:
![original](https://github.com/user-attachments/assets/22cb69a0-1b37-44a5-8b98-0ad99bb690a8)

and a masked image:
![mask](https://github.com/user-attachments/assets/932d420b-d653-40f9-9a72-3ff12fc8939e)

with the prompt : "replace the outfit with a formal suit". The results:
<img width="949" alt="image" src="https://github.com/user-attachments/assets/c9125d82-1aba-43ba-beae-50ca2a8294bc" />



---

## License
This project is licensed under the MIT License.

---
## Author
Salma Zine
salmazine2021@gmail.com

