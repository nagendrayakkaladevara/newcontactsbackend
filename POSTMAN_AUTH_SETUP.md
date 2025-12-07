# How to Add API Key in Postman

This guide shows you how to configure authentication (API Key + Basic Auth) in Postman for testing this API.

## 🔑 Important: Both Authentication Methods Required

This API requires **BOTH**:
1. **API Key** (via `X-API-Key` header or query parameter)
2. **Basic Authentication** (via `Authorization` header)

## 📋 Step-by-Step Instructions

### Step 1: Get Your Credentials

First, check your `.env` file for these values:
- `API_KEY` - Your API key
- `BASIC_AUTH_USERNAME` - Your Basic Auth username
- `BASIC_AUTH_PASSWORD` - Your Basic Auth password

**Default values (if not set in .env):**
- API Key: `change-this-api-key-in-production`
- Username: `admin`
- Password: `change-this-password-in-production`

### Step 2: Configure Authentication in Postman

#### Method 1: Using Headers Tab (Recommended)

1. **Open your request in Postman**
2. **Click on the "Headers" tab**
3. **Add the API Key header:**
   - **Key:** `X-API-Key`
   - **Value:** `your-api-key-from-env` (e.g., `change-this-api-key-in-production`)
   - ✅ **Check the checkbox** to enable it

4. **Add the Basic Auth header:**
   - **Key:** `Authorization`
   - **Value:** `Basic <base64-encoded-credentials>`
   
   **To generate the base64 value:**
   - Format: `username:password` (e.g., `admin:change-this-password-in-production`)
   - Encode it to base64:
     - **Online:** Use [base64encode.org](https://www.base64encode.org/)
     - **Postman:** Use Postman's built-in Basic Auth (see Method 2 below)
     - **Command line:** `echo -n "admin:password" | base64`
   - ✅ **Check the checkbox** to enable it

#### Method 2: Using Postman's Authorization Tab (Easier for Basic Auth)

1. **Click on the "Authorization" tab** in Postman
2. **For Basic Auth:**
   - **Type:** Select `Basic Auth` from dropdown
   - **Username:** Enter your `BASIC_AUTH_USERNAME` (e.g., `admin`)
   - **Password:** Enter your `BASIC_AUTH_PASSWORD`
   - Postman will automatically encode this for you!

3. **For API Key:**
   - **Still go to "Headers" tab** (API key can't be set in Authorization tab)
   - **Add header:**
     - **Key:** `X-API-Key`
     - **Value:** Your API key value
     - ✅ **Check the checkbox**

#### Method 3: Using Query Parameter (Less Secure)

1. **Go to "Params" tab**
2. **Add query parameter:**
   - **Key:** `apiKey`
   - **Value:** Your API key value
   - ✅ **Check the checkbox**

3. **Still need Basic Auth:**
   - Use Method 2 (Authorization tab) for Basic Auth, or
   - Add `Authorization` header manually in Headers tab

## 🎯 Complete Example Setup

### Example 1: Using Headers Tab (Manual)

**Headers Tab:**
```
X-API-Key: change-this-api-key-in-production
Authorization: Basic YWRtaW46Y2hhbmdlLXRoaXMtcGFzc3dvcmQtaW4tcHJvZHVjdGlvbg==
```

### Example 2: Using Authorization Tab + Headers Tab (Recommended)

**Authorization Tab:**
- Type: `Basic Auth`
- Username: `admin`
- Password: `change-this-password-in-production`

**Headers Tab:**
```
X-API-Key: change-this-api-key-in-production
```

### Example 3: Using Query Parameter

**Params Tab:**
```
apiKey: change-this-api-key-in-production
```

**Authorization Tab:**
- Type: `Basic Auth`
- Username: `admin`
- Password: `change-this-password-in-production`

## 🔧 Setting Up Postman Environment Variables (Recommended)

To avoid typing credentials every time:

1. **Click on the eye icon** (top right) or go to **Environments**
2. **Click "Add"** to create a new environment
3. **Name it:** `Local Development` (or any name)
4. **Add variables:**
   - `api_key` = `change-this-api-key-in-production`
   - `basic_auth_username` = `admin`
   - `basic_auth_password` = `change-this-password-in-production`
5. **Save the environment**
6. **Select the environment** from the dropdown (top right)

7. **Use variables in your requests:**
   - In Headers tab: `X-API-Key` = `{{api_key}}`
   - In Authorization tab: Username = `{{basic_auth_username}}`, Password = `{{basic_auth_password}}`

## 📝 Quick Reference

### Headers You Need:

| Header Name | Value | Required |
|------------|-------|----------|
| `X-API-Key` | Your API key from `.env` | ✅ Yes |
| `Authorization` | `Basic <base64(username:password)>` | ✅ Yes |

### Alternative for API Key:

| Location | Key | Value |
|----------|-----|-------|
| Query Params | `apiKey` | Your API key from `.env` |

## ✅ Testing Your Setup

1. **Create a GET request** to: `http://localhost:3000/api/contacts`
2. **Add both authentication methods** (as shown above)
3. **Send the request**
4. **Expected:** You should get a 200 OK response with contacts data
5. **If you get 401:** Check that both API key and Basic Auth are correct

## 🐛 Troubleshooting

### Error: "API key required"
- ✅ Make sure `X-API-Key` header is added and enabled (checkbox checked)
- ✅ Or add `apiKey` query parameter
- ✅ Verify the API key value matches your `.env` file

### Error: "Basic authentication required"
- ✅ Make sure `Authorization` header is set to `Basic <encoded-value>`
- ✅ Or use Postman's Authorization tab with Basic Auth type
- ✅ Verify username and password match your `.env` file

### Error: "Invalid API key"
- ✅ Check that the API key in Postman matches `API_KEY` in your `.env` file
- ✅ Make sure there are no extra spaces
- ✅ Restart your server after changing `.env` file

### Error: "Invalid authentication credentials"
- ✅ Verify both API key AND Basic Auth are correct
- ✅ Check that username matches `BASIC_AUTH_USERNAME` in `.env`
- ✅ Check that password matches `BASIC_AUTH_PASSWORD` in `.env`

## 🎬 Visual Guide

### Headers Tab Setup:
```
┌─────────────────────────────────────────┐
│ Headers                                 │
├──────────────────┬──────────────────────┤
│ Key              │ Value                │
├──────────────────┼──────────────────────┤
│ ✅ X-API-Key     │ your-api-key-here    │
│ ✅ Authorization │ Basic YWRtaW46...    │
└──────────────────┴──────────────────────┘
```

### Authorization Tab Setup:
```
┌─────────────────────────────────────────┐
│ Authorization                           │
├─────────────────────────────────────────┤
│ Type: [Basic Auth ▼]                    │
│ Username: admin                         │
│ Password: •••••••••••••                 │
└─────────────────────────────────────────┘
```

## 📚 Related Documentation

- `API_KEY_AUTH_GUIDE.md` - Full authentication guide
- `POSTMAN_TESTING_GUIDE.md` - Testing bulk upload endpoint

