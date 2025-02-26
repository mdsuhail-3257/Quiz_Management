# Standard Operating Procedure (SOP) for Daily Quiz Automation

## Overview

This document outlines the **Standard Operating Procedure (SOP)** for the **Daily Quiz Automation System** using Google Forms and Google Sheets. The system automates quiz distribution, response collection, scoring, and result notifications.

## 1. System Components

The system consists of the following Google Sheets:

- **Quiz\_Registration**: Stores registered users (Name, Email, Status)
- **Daily\_Quizzes**: Contains the daily quiz questions and correct answers
- **Form Responses 1**: Automatically collects responses from Google Forms
- **Quiz\_Response**: Stores validated responses from registered users
- **Quiz\_History**: Maintains historical records of past quizzes
- **Quiz\_Result**: Stores the final quiz results, including scores and attempt status

## 2. Daily Quiz Process Flow

The automation follows a structured workflow:

1. **Update Quiz Form** (`updateQuizForm()`)
2. **Send Quiz to Users** (`sendQuizToUsers()`)
3. **Move Form Responses** (`moveFormResponses()`)
4. **Store Quiz History** (`storeQuizHistory()`)
5. **Process Quiz Results** (`processQuizResults()`)
6. **Notify Users** (`notifyUsers()`)

---

## 3. Detailed Steps

### Step 1: Update Quiz Form

- The script fetches **10 questions** from **Daily\_Quizzes**.
- Updates Google Form with **Questions and Options**.
- Excludes question numbers in the form.
- Ensures answers are stored correctly for evaluation.
- **Trigger Time**: 4 AM Daily

### Step 2: Send Quiz to Users

- Fetches registered emails from **Quiz\_Registration**.
- Sends quiz link to registered users.
- Ensures only registered users can submit responses.
- **Trigger Time**: 5 AM Daily

### Step 3: Move Form Responses

- Collects submitted responses from **Form Responses 1**.
- Validates responses using registered email from **Quiz\_Registration**.
- **Only one valid response per user** is stored in **Quiz\_Response**.
- **Trigger Interval**: Every 5 minutes

### Step 4: Store Quiz History

- At the end of the day, quiz questions and correct answers are stored in **Quiz\_History**.
- Maintains records for reference and auditing.
- **Trigger Time**: 11:30 PM Daily

### Step 5: Process Quiz Results

- Compares user responses from **Quiz\_Response** against correct answers from **Daily\_Quizzes**.
- Calculates the **score out of 10**.
- Updates **Quiz\_Result** sheet with:
  - **Date**
  - **Email**
  - **Name**
  - **Score**
  - **Attempt Status** (Attempted / Absent)
- **Trigger Time**: 11:30 PM Daily

### Step 6: Notify Users

- Sends email notifications:
  - **Attempted users**: Receive their quiz score.
  - **Absent users**: Receive a reminder email.
- Ensures all users are informed daily.
- **Trigger Time**: 11:30 PM Daily

---

## 4. Example Data & Execution

### Example Registered User in **Quiz\_Registration**:

| Name     | Email                                                | Status |
| -------- | ---------------------------------------------------- | ------ |
| Mohammad | [member@sio-kurla.com](mailto\:member@sio-kurla.com) | Active |

### Example Quiz Entry in **Daily\_Quizzes**:

| Question No. | Question          | Option 1 | Option 2 | Option 3 | Option 4 | Answer |
| ------------ | ----------------- | -------- | -------- | -------- | -------- | ------ |
| 1            | Capital of India? | Mumbai   | Delhi    | Chennai  | Kolkata  | Delhi  |

### Example Quiz Response in **Form Responses 1**:

| Date       | Email                                                | Score | Q1 Ans | Q2 Ans | Q3 Ans | ... |
| ---------- | ---------------------------------------------------- | ----- | ------ | ------ | ------ | --- |
| 2025-02-26 | [member@sio-kurla.com](mailto\:member@sio-kurla.com) |       | Delhi  | Apple  | 42     | ... |

### Example Processed Result in **Quiz\_Result**:

| Date       | Email                                                | Name     | Score | Attempt Status |
| ---------- | ---------------------------------------------------- | -------- | ----- | -------------- |
| 2025-02-26 | [member@sio-kurla.com](mailto\:member@sio-kurla.com) | Mohammad | 9/10  | Attempted      |

---

## 5. Troubleshooting & FAQs

### 1. **Users getting an error: "Email not registered"**

- Ensure the user's email is listed in **Quiz\_Registration**.
- Verify case sensitivity (Emails should match exactly).

### 2. **Google Form responses not collecting correctly?**

- Check that **Form Responses 1** is properly linked.
- Unlink and relink if columns are duplicated.

### 3. **Scores not updating in Form Responses 1?**

- Scores are calculated in **Quiz\_Result**, not in Form Responses.
- Ensure `processQuizResults()` runs properly.

### 4. **Users receiving multiple quiz response alerts?**

- Ensure `moveFormResponses()` prevents duplicate submissions.
- Enable "One response per user" in Google Form settings.

---

## 6. Setup & Configuration

### A. First-Time Setup

1. **Create Google Sheets** with the required sheet names.
2. **Set up Google Form** and link it to **Form Responses 1**.
3. **Copy the script into Google Apps Script**.
4. **Set Triggers** using:
   ```javascript
   setAllTriggers();
   ```

### B. Updating Questions Daily

- Add 10 new questions in **Daily\_Quizzes**.
- Ensure correct answers are in **Column G**.
- Run `updateQuizForm()` after updating.

---

## 7. Future Enhancements

- Automate question selection from a larger pool.
- Introduce leaderboard tracking for participants.
- Implement a user dashboard for performance tracking.

---

## 8. Contact & Support

For any issues, contact **Mohammad** at [**member@sio-kurla.com**](mailto\:member@sio-kurla.com).

---

**✅ Quiz Automation Successfully Configured & Running! 🚀**

