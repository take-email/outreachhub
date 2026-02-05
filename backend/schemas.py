from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
from enum import Enum

class OutreachStatusEnum(str, Enum):
    MESSAGE_GENERATED = "message_generated"
    MESSAGE_SENT = "message_sent"
    REPLIED = "replied"
    CLOSED = "closed"
    GIVEAWAY_RUNNING = "giveaway_running"

# Tool Schemas
class ToolBase(BaseModel):
    tool_name: str
    tool_description: Optional[str] = None
    website_url: Optional[str] = None
    source_url: Optional[str] = None

class ToolCreate(ToolBase):
    pass

class ToolUpdate(BaseModel):
    tool_name: Optional[str] = None
    tool_description: Optional[str] = None
    website_url: Optional[str] = None
    source_url: Optional[str] = None

class ToolResponse(ToolBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
    created_at: datetime
    updated_at: datetime

# Founder Schemas
class FounderBase(BaseModel):
    founder_name: str
    social_profile_url: Optional[str] = None
    tool_id: Optional[str] = None

class FounderCreate(FounderBase):
    pass

class FounderUpdate(BaseModel):
    founder_name: Optional[str] = None
    social_profile_url: Optional[str] = None
    tool_id: Optional[str] = None

class FounderResponse(FounderBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
    created_at: datetime
    updated_at: datetime
    tool: Optional[ToolResponse] = None

# Facebook Profile Schemas
class FacebookProfileBase(BaseModel):
    profile_name: str
    template_id: Optional[str] = None

class FacebookProfileCreate(FacebookProfileBase):
    pass

class FacebookProfileUpdate(BaseModel):
    profile_name: Optional[str] = None
    template_id: Optional[str] = None

class FacebookProfileResponse(FacebookProfileBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
    created_at: datetime
    updated_at: datetime

# Template Schemas
class TemplateBase(BaseModel):
    template_name: str
    template_content: str

class TemplateCreate(TemplateBase):
    pass

class TemplateUpdate(BaseModel):
    template_name: Optional[str] = None
    template_content: Optional[str] = None

class TemplateResponse(TemplateBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
    created_at: datetime
    updated_at: datetime


# Combined Tool + Founder Creation
class ToolFounderCreate(BaseModel):
    tool_name: str
    tool_description: Optional[str] = None
    website_url: Optional[str] = None
    source_url: Optional[str] = None
    founder_name: str
    social_profile_url: Optional[str] = None

class ToolFounderResponse(BaseModel):
    tool: ToolResponse
    founder: FounderResponse


# Outreach Record Schemas
class OutreachRecordBase(BaseModel):
    founder_id: str
    tool_id: str
    fb_profile_id: str
    template_id: Optional[str] = None
    generated_message: Optional[str] = None
    note: Optional[str] = None
    status: OutreachStatusEnum = OutreachStatusEnum.MESSAGE_GENERATED

class OutreachRecordCreate(BaseModel):
    founder_id: str
    fb_profile_id: str

class OutreachRecordUpdate(BaseModel):
    status: Optional[OutreachStatusEnum] = None
    generated_message: Optional[str] = None
    note: Optional[str] = None

class OutreachRecordResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    founder_id: str
    tool_id: str
    fb_profile_id: str
    template_id: Optional[str] = None
    generated_message: Optional[str] = None
    note: Optional[str] = None
    status: OutreachStatusEnum
    created_at: datetime
    updated_at: datetime
    founder: Optional[FounderResponse] = None
    tool: Optional[ToolResponse] = None
    facebook_profile: Optional[FacebookProfileResponse] = None
    template: Optional[TemplateResponse] = None

# Generate Message Request
class GenerateMessageRequest(BaseModel):
    founder_id: str
    fb_profile_id: str

# Stats Response
class DashboardStats(BaseModel):
    total_founders: int
    total_messages_sent: int
    total_replies: int
    reply_rate: float
