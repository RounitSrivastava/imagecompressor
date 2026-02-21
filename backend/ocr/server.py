from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from pdf2docx import Converter
import uuid
import os

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TEMP = os.path.join(BASE_DIR, "temp")

os.makedirs(TEMP, exist_ok=True)

@app.route("/pdf-to-word", methods=["POST"])
def convert():
    try:
        if "file" not in request.files:
            return jsonify({"error": "No file"}), 400

        file = request.files["file"]

        uid = str(uuid.uuid4())
        pdf_path = os.path.join(TEMP, uid + ".pdf")
        docx_path = os.path.join(TEMP, uid + ".docx")

        file.save(pdf_path)

        print("Saved PDF:", pdf_path)

        cv = Converter(pdf_path)
        cv.convert(docx_path)
        cv.close()

        if not os.path.exists(docx_path):
            return jsonify({"error": "DOCX not created"}), 500

        response = send_file(docx_path, as_attachment=True)

        @response.call_on_close
        def cleanup():
            try:
                if os.path.exists(pdf_path):
                    os.remove(pdf_path)
                if os.path.exists(docx_path):
                    os.remove(docx_path)
            except Exception as e:
                print("Cleanup error:", e)

        return response

    except Exception as e:
        print("SERVER ERROR:", e)
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=7000)