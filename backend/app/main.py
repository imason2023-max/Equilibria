from fastapi import FastAPI

app = FastAPI(title="Recovery-Aware Training API")


@app.get("/health")
def health_check():
    return {"status": "ok"}


# later:
# - include_router(auth.router, prefix="/auth")
# - include_router(recovery.router, prefix="/recovery")
# - include_router(workouts.router, prefix="/workouts")
