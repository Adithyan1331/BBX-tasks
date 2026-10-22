
import os
import re
import secrets
from pathlib import Path

from flask import (
    Flask, render_template, request, session, redirect, url_for
)
from werkzeug.utils import secure_filename

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY")

if not app.secret_key:
    raise RuntimeError("Set the SECRET_KEY environment variable.")

app.config["MAX_CONTENT_LENGTH"] = 2 * 1024 * 1024  # 2 MB
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

ALLOWED_EXTENSIONS = {"pdf"}
ALLOWED_GENDERS = {"female", "male", "nonbinary", "prefer_not"}
ALLOWED_INTERESTS = {"web", "python", "ai"}


def validate_registration(form, uploaded_file):
    # Intentional duplication: client-side rules can be removed or bypassed.
    # Server-side validation is the security boundary and must independently
    # enforce every rule on data received from an untrusted client.
    errors = {}

    name = form.get("name", "").strip()
    email = form.get("email", "").strip()
    password = form.get("password", "")
    phone = form.get("phone", "").strip()
    age_text = form.get("age", "").strip()
    gender = form.get("gender", "")
    interests = form.getlist("interests")

    if not 2 <= len(name) <= 60:
        errors["name"] = "Name must contain 2–60 characters."
    if not re.fullmatch(r"[A-Za-z][A-Za-z .'-]{1,59}", name):
        errors["name"] = "Use letters, spaces, apostrophes, periods or hyphens."

    if len(email) > 254 or not re.fullmatch(
        r"[^@\s]+@[^@\s]+\.[^@\s]+", email
    ):
        errors["email"] = "Enter a valid email address."

    if not 12 <= len(password) <= 64:
        errors["password"] = "Password must contain 12–64 characters."

    # Phone numbers are strings, not quantities; leading zeros and a + prefix
    # must be preserved. The HTML input therefore uses type='tel', not number.
    if not re.fullmatch(r"\+?[0-9]{10,15}", phone):
        errors["phone"] = "Enter 10–15 digits, optionally starting with +."

    try:
        age = int(age_text)
        if not 18 <= age <= 100:
            errors["age"] = "Age must be between 18 and 100."
    except ValueError:
        errors["age"] = "Enter a whole-number age."

    if gender not in ALLOWED_GENDERS:
        errors["gender"] = "Choose one of the listed options."

    if not interests or not set(interests).issubset(ALLOWED_INTERESTS):
        errors["interests"] = "Choose at least one valid interest."

    if not uploaded_file or not uploaded_file.filename:
        errors["resume"] = "Upload a PDF file."
    else:
        filename = secure_filename(uploaded_file.filename)
        if not filename or Path(filename).suffix.lower() not in ALLOWED_EXTENSIONS:
            errors["resume"] = "Only PDF files are accepted."

    return errors


@app.route("/", methods=["GET", "POST"])
def register():
    if request.method == "GET":
        session["form_token"] = secrets.token_urlsafe(32)
        return render_template("register.html", errors={})

    # Detect missing or modified hidden token values.
    sent_token = request.form.get("form_token", "")
    expected_token = session.get("form_token", "")
    if not expected_token or not secrets.compare_digest(
        sent_token, expected_token
    ):
        return "Invalid or modified form token. Reload the form.", 400

    errors = validate_registration(request.form, request.files.get("resume"))

    if errors:
        return render_template("register.html", errors=errors), 400

    # Store the uploaded file under a random name, not the supplied filename.
    uploaded_file = request.files["resume"]
    stored_name = secrets.token_hex(16) + ".pdf"
    uploaded_file.save(UPLOAD_DIR / stored_name)

    # Consume token so the same form submission cannot be replayed unchanged.
    session.pop("form_token", None)

    # Never display the raw password or store it as a registration detail.
    details = {
        "name": request.form["name"].strip(),
        "email": request.form["email"].strip(),
        "phone": request.form["phone"].strip(),
        "age": request.form["age"].strip(),
        "gender": request.form["gender"],
        "interests": request.form.getlist("interests"),
    }

    return render_template("result.html", details=details)


@app.errorhandler(413)
def file_too_large(_error):
    return "Upload exceeds the 2 MB limit.", 413


if __name__ == "__main__":
    app.run(debug=True)
