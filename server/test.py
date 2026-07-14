from auth.password import hash_password, verify_password

hashed = hash_password("password123")

print(hashed)
print(verify_password("password123", hashed))
print(verify_password("wrongpassword", hashed))