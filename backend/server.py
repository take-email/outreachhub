from fastapi import FastAPI, APIRouter, Depends, HTTPException, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
import os
import logging
from pathlib import Path
from typing import List, Optional
from datetime import datetime, timezone

from database import get_db, engine, Base
from models import Tool, Founder, FacebookProfile, Template, OutreachRecord, OutreachStatus
from schemas import (
    ToolCreate, ToolUpdate, ToolResponse,
    FounderCreate, FounderUpdate, FounderResponse,
    FacebookProfileCreate, FacebookProfileUpdate, FacebookProfileResponse,
    TemplateCreate, TemplateUpdate, TemplateResponse,
    OutreachRecordCreate, OutreachRecordUpdate, OutreachRecordResponse,
    GenerateMessageRequest, DashboardStats, OutreachStatusEnum,
    ToolFounderCreate, ToolFounderResponse
)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

app = FastAPI(title="Founder Outreach Manager API")
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============== TOOLS ENDPOINTS ==============
@api_router.get("/tools", response_model=List[ToolResponse])
async def get_tools(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Tool).order_by(Tool.created_at.desc()))
    return result.scalars().all()

@api_router.post("/tools", response_model=ToolResponse)
async def create_tool(tool: ToolCreate, db: AsyncSession = Depends(get_db)):
    db_tool = Tool(**tool.model_dump())
    db.add(db_tool)
    await db.commit()
    await db.refresh(db_tool)
    return db_tool

@api_router.get("/tools/{tool_id}", response_model=ToolResponse)
async def get_tool(tool_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Tool).where(Tool.id == tool_id))
    tool = result.scalar_one_or_none()
    if not tool:
        raise HTTPException(status_code=404, detail="Tool not found")
    return tool

@api_router.put("/tools/{tool_id}", response_model=ToolResponse)
async def update_tool(tool_id: str, tool_update: ToolUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Tool).where(Tool.id == tool_id))
    tool = result.scalar_one_or_none()
    if not tool:
        raise HTTPException(status_code=404, detail="Tool not found")
    
    update_data = tool_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(tool, key, value)
    tool.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(tool)
    return tool

@api_router.delete("/tools/{tool_id}")
async def delete_tool(tool_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Tool).where(Tool.id == tool_id))
    tool = result.scalar_one_or_none()
    if not tool:
        raise HTTPException(status_code=404, detail="Tool not found")
    await db.delete(tool)
    await db.commit()
    return {"message": "Tool deleted successfully"}

# ============== FOUNDERS ENDPOINTS ==============
@api_router.get("/founders", response_model=List[FounderResponse])
async def get_founders(
    tool_id: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    query = select(Founder).options(selectinload(Founder.tool)).order_by(Founder.created_at.desc())
    if tool_id:
        query = query.where(Founder.tool_id == tool_id)
    result = await db.execute(query)
    return result.scalars().all()

@api_router.post("/founders", response_model=FounderResponse)
async def create_founder(founder: FounderCreate, db: AsyncSession = Depends(get_db)):
    db_founder = Founder(**founder.model_dump())
    db.add(db_founder)
    await db.commit()
    await db.refresh(db_founder)
    # Reload with tool relationship
    result = await db.execute(
        select(Founder).options(selectinload(Founder.tool)).where(Founder.id == db_founder.id)
    )
    return result.scalar_one()

@api_router.get("/founders/{founder_id}", response_model=FounderResponse)
async def get_founder(founder_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Founder).options(selectinload(Founder.tool)).where(Founder.id == founder_id)
    )
    founder = result.scalar_one_or_none()
    if not founder:
        raise HTTPException(status_code=404, detail="Founder not found")
    return founder

@api_router.put("/founders/{founder_id}", response_model=FounderResponse)
async def update_founder(founder_id: str, founder_update: FounderUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Founder).where(Founder.id == founder_id))
    founder = result.scalar_one_or_none()
    if not founder:
        raise HTTPException(status_code=404, detail="Founder not found")
    
    update_data = founder_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(founder, key, value)
    founder.updated_at = datetime.now(timezone.utc)
    await db.commit()
    
    # Reload with tool relationship
    result = await db.execute(
        select(Founder).options(selectinload(Founder.tool)).where(Founder.id == founder_id)
    )
    return result.scalar_one()

@api_router.delete("/founders/{founder_id}")
async def delete_founder(founder_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Founder).where(Founder.id == founder_id))
    founder = result.scalar_one_or_none()
    if not founder:
        raise HTTPException(status_code=404, detail="Founder not found")
    await db.delete(founder)
    await db.commit()
    return {"message": "Founder deleted successfully"}

# ============== FACEBOOK PROFILES ENDPOINTS ==============
@api_router.get("/profiles", response_model=List[FacebookProfileResponse])
async def get_profiles(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(FacebookProfile).order_by(FacebookProfile.created_at.desc()))
    return result.scalars().all()

@api_router.post("/profiles", response_model=FacebookProfileResponse)
async def create_profile(profile: FacebookProfileCreate, db: AsyncSession = Depends(get_db)):
    db_profile = FacebookProfile(**profile.model_dump())
    db.add(db_profile)
    await db.commit()
    await db.refresh(db_profile)
    return db_profile

@api_router.get("/profiles/{profile_id}", response_model=FacebookProfileResponse)
async def get_profile(profile_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(FacebookProfile).where(FacebookProfile.id == profile_id))
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

@api_router.put("/profiles/{profile_id}", response_model=FacebookProfileResponse)
async def update_profile(profile_id: str, profile_update: FacebookProfileUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(FacebookProfile).where(FacebookProfile.id == profile_id))
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    update_data = profile_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(profile, key, value)
    profile.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(profile)
    return profile

@api_router.delete("/profiles/{profile_id}")
async def delete_profile(profile_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(FacebookProfile).where(FacebookProfile.id == profile_id))
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    await db.delete(profile)
    await db.commit()
    return {"message": "Profile deleted successfully"}

# ============== TEMPLATES ENDPOINTS ==============
@api_router.get("/templates", response_model=List[TemplateResponse])
async def get_templates(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Template).order_by(Template.created_at.desc()))
    return result.scalars().all()

@api_router.post("/templates", response_model=TemplateResponse)
async def create_template(template: TemplateCreate, db: AsyncSession = Depends(get_db)):
    db_template = Template(**template.model_dump())
    db.add(db_template)
    await db.commit()
    await db.refresh(db_template)
    return db_template

@api_router.get("/templates/{template_id}", response_model=TemplateResponse)
async def get_template(template_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Template).where(Template.id == template_id))
    template = result.scalar_one_or_none()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    return template

@api_router.put("/templates/{template_id}", response_model=TemplateResponse)
async def update_template(template_id: str, template_update: TemplateUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Template).where(Template.id == template_id))
    template = result.scalar_one_or_none()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    update_data = template_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(template, key, value)
    template.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(template)
    return template

@api_router.delete("/templates/{template_id}")
async def delete_template(template_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Template).where(Template.id == template_id))
    template = result.scalar_one_or_none()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    await db.delete(template)
    await db.commit()
    return {"message": "Template deleted successfully"}

# ============== OUTREACH RECORDS ENDPOINTS ==============
@api_router.get("/outreach", response_model=List[OutreachRecordResponse])
async def get_outreach_records(
    tool_id: Optional[str] = Query(None),
    founder_id: Optional[str] = Query(None),
    fb_profile_id: Optional[str] = Query(None),
    status: Optional[OutreachStatusEnum] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    query = select(OutreachRecord).options(
        selectinload(OutreachRecord.founder).selectinload(Founder.tool),
        selectinload(OutreachRecord.tool),
        selectinload(OutreachRecord.facebook_profile),
        selectinload(OutreachRecord.template)
    ).order_by(OutreachRecord.updated_at.desc())
    
    if tool_id:
        query = query.where(OutreachRecord.tool_id == tool_id)
    if founder_id:
        query = query.where(OutreachRecord.founder_id == founder_id)
    if fb_profile_id:
        query = query.where(OutreachRecord.fb_profile_id == fb_profile_id)
    if status:
        query = query.where(OutreachRecord.status == OutreachStatus(status.value))
    
    result = await db.execute(query)
    return result.scalars().all()

@api_router.post("/outreach/generate", response_model=OutreachRecordResponse)
async def generate_outreach_message(request: GenerateMessageRequest, db: AsyncSession = Depends(get_db)):
    # Get founder with tool
    result = await db.execute(
        select(Founder).options(selectinload(Founder.tool)).where(Founder.id == request.founder_id)
    )
    founder = result.scalar_one_or_none()
    if not founder:
        raise HTTPException(status_code=404, detail="Founder not found")
    if not founder.tool:
        raise HTTPException(status_code=400, detail="Founder has no linked tool")
    
    # Get FB profile with template
    result = await db.execute(
        select(FacebookProfile).options(selectinload(FacebookProfile.template)).where(FacebookProfile.id == request.fb_profile_id)
    )
    fb_profile = result.scalar_one_or_none()
    if not fb_profile:
        raise HTTPException(status_code=404, detail="Facebook profile not found")
    if not fb_profile.template:
        raise HTTPException(status_code=400, detail="Facebook profile has no linked template")
    
    # Generate message from template
    template_content = fb_profile.template.template_content
    generated_message = template_content.replace("{founder_name}", founder.founder_name)
    generated_message = generated_message.replace("{tool_name}", founder.tool.tool_name)
    generated_message = generated_message.replace("{tool_description}", founder.tool.tool_description or "")
    
    # Create outreach record
    outreach = OutreachRecord(
        founder_id=founder.id,
        tool_id=founder.tool.id,
        fb_profile_id=fb_profile.id,
        template_id=fb_profile.template.id,
        generated_message=generated_message,
        status=OutreachStatus.MESSAGE_GENERATED
    )
    db.add(outreach)
    await db.commit()
    
    # Reload with all relationships
    result = await db.execute(
        select(OutreachRecord).options(
            selectinload(OutreachRecord.founder).selectinload(Founder.tool),
            selectinload(OutreachRecord.tool),
            selectinload(OutreachRecord.facebook_profile),
            selectinload(OutreachRecord.template)
        ).where(OutreachRecord.id == outreach.id)
    )
    return result.scalar_one()

@api_router.put("/outreach/{outreach_id}", response_model=OutreachRecordResponse)
async def update_outreach_record(outreach_id: str, update: OutreachRecordUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(OutreachRecord).where(OutreachRecord.id == outreach_id))
    outreach = result.scalar_one_or_none()
    if not outreach:
        raise HTTPException(status_code=404, detail="Outreach record not found")
    
    update_data = update.model_dump(exclude_unset=True)
    if 'status' in update_data:
        update_data['status'] = OutreachStatus(update_data['status'].value)
    for key, value in update_data.items():
        setattr(outreach, key, value)
    outreach.updated_at = datetime.now(timezone.utc)
    await db.commit()
    
    # Reload with all relationships
    result = await db.execute(
        select(OutreachRecord).options(
            selectinload(OutreachRecord.founder).selectinload(Founder.tool),
            selectinload(OutreachRecord.tool),
            selectinload(OutreachRecord.facebook_profile),
            selectinload(OutreachRecord.template)
        ).where(OutreachRecord.id == outreach_id)
    )
    return result.scalar_one()

@api_router.delete("/outreach/{outreach_id}")
async def delete_outreach_record(outreach_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(OutreachRecord).where(OutreachRecord.id == outreach_id))
    outreach = result.scalar_one_or_none()
    if not outreach:
        raise HTTPException(status_code=404, detail="Outreach record not found")
    await db.delete(outreach)
    await db.commit()
    return {"message": "Outreach record deleted successfully"}

# ============== STATS ENDPOINT ==============
@api_router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(db: AsyncSession = Depends(get_db)):
    # Total founders
    result = await db.execute(select(func.count(Founder.id)))
    total_founders = result.scalar() or 0
    
    # Total messages sent (status >= MESSAGE_SENT)
    result = await db.execute(
        select(func.count(OutreachRecord.id)).where(
            OutreachRecord.status.in_([
                OutreachStatus.MESSAGE_SENT,
                OutreachStatus.REPLIED,
                OutreachStatus.CLOSED,
                OutreachStatus.GIVEAWAY_RUNNING
            ])
        )
    )
    total_messages_sent = result.scalar() or 0
    
    # Total replies
    result = await db.execute(
        select(func.count(OutreachRecord.id)).where(
            OutreachRecord.status.in_([
                OutreachStatus.REPLIED,
                OutreachStatus.GIVEAWAY_RUNNING
            ])
        )
    )
    total_replies = result.scalar() or 0
    
    # Reply rate
    reply_rate = (total_replies / total_messages_sent * 100) if total_messages_sent > 0 else 0
    
    return DashboardStats(
        total_founders=total_founders,
        total_messages_sent=total_messages_sent,
        total_replies=total_replies,
        reply_rate=round(reply_rate, 1)
    )

@api_router.get("/")
async def root():
    return {"message": "Founder Outreach Manager API"}

# Include router and add middleware
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)
