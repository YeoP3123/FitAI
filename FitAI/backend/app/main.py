from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import boto3
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# CORS 설정 추가 (중요!)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 개발 중에는 *, 배포시에는 프론트엔드 URL로 변경
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# DynamoDB 설정
dynamodb = boto3.resource(
    'dynamodb',
    region_name=os.getenv('AWS_REGION', 'ap-northeast-2'),
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY')
)

TABLE_PREFIX = os.getenv('TABLE_PREFIX', 'ysu-capstone-1-')

@app.get("/")
async def root():
    return {"message": "FitAI API Server"}

# ========== Exercise API (프론트엔드용) ==========
@app.get("/exercises")
async def get_exercises():
    """운동 목록 가져오기"""
    try:
        table = dynamodb.Table(f"{TABLE_PREFIX}Exercise")
        response = table.scan()
        return {
            "success": True,
            "data": response.get('Items', [])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/exercises/{exercise_id}")
async def get_exercise_by_id(exercise_id: str):
    """특정 운동 정보 가져오기"""
    try:
        table = dynamodb.Table(f"{TABLE_PREFIX}Exercise")
        response = table.get_item(Key={'exercise_id': exercise_id})
        
        if 'Item' not in response:
            raise HTTPException(status_code=404, detail="운동을 찾을 수 없습니다")
        
        return {
            "success": True,
            "data": response['Item']
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ========== Post API (프론트엔드용) ==========
@app.get("/posts")
async def get_posts(limit: int = 20):
    """게시글 목록 가져오기"""
    try:
        table = dynamodb.Table(f"{TABLE_PREFIX}Post")
        response = table.scan(Limit=limit)
        return {
            "success": True,
            "data": response.get('Items', [])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/posts/{post_id}")
async def get_post_by_id(post_id: str):
    """특정 게시글 가져오기"""
    try:
        table = dynamodb.Table(f"{TABLE_PREFIX}Post")
        response = table.get_item(Key={'post_id': post_id})
        
        if 'Item' not in response:
            raise HTTPException(status_code=404, detail="게시글을 찾을 수 없습니다")
        
        return {
            "success": True,
            "data": response['Item']
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ========== 테스트용 엔드포인트 ==========
@app.get("/test/exercises")
async def test_exercises():
    """Exercise 테이블 데이터 가져오기 (테스트용)"""
    try:
        table = dynamodb.Table(f"{TABLE_PREFIX}Exercise")
        response = table.scan()
        return {
            "success": True,
            "count": len(response.get('Items', [])),
            "data": response.get('Items', [])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/test/posts")
async def test_posts():
    """Post 테이블 데이터 가져오기 (테스트용)"""
    try:
        table = dynamodb.Table(f"{TABLE_PREFIX}Post")
        response = table.scan()
        return {
            "success": True,
            "count": len(response.get('Items', [])),
            "data": response.get('Items', [])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/test/tables")
async def test_all_tables():
    """모든 테이블 존재 확인"""
    tables = ['Exercise', 'Preset', 'Session', 'Attendance', 'Post', 'Comment', 'PostLike']
    result = {}
    
    for table_name in tables:
        try:
            table = dynamodb.Table(f"{TABLE_PREFIX}{table_name}")
            table.load()
            result[table_name] = "✅ 존재"
        except Exception as e:
            result[table_name] = f"❌ 오류: {str(e)}"
    
    return result