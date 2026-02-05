import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, ForeignKey, DateTime, Enum as SQLEnum
from sqlalchemy.orm import relationship
from database import Base
import enum

def generate_uuid():
    return str(uuid.uuid4())

class OutreachStatus(enum.Enum):
    MESSAGE_GENERATED = "message_generated"
    MESSAGE_SENT = "message_sent"
    REPLIED = "replied"
    CLOSED = "closed"
    GIVEAWAY_RUNNING = "giveaway_running"

class Tool(Base):
    __tablename__ = 'tools'
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    tool_name = Column(String(255), nullable=False, index=True)
    tool_description = Column(Text, nullable=True)
    website_url = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    founders = relationship('Founder', back_populates='tool', cascade='all, delete-orphan')
    outreach_records = relationship('OutreachRecord', back_populates='tool', cascade='all, delete-orphan')

class Founder(Base):
    __tablename__ = 'founders'
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    founder_name = Column(String(255), nullable=False, index=True)
    social_profile_url = Column(String(500), nullable=True)
    tool_id = Column(String(36), ForeignKey('tools.id', ondelete='CASCADE'), nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    tool = relationship('Tool', back_populates='founders')
    outreach_records = relationship('OutreachRecord', back_populates='founder', cascade='all, delete-orphan')

class FacebookProfile(Base):
    __tablename__ = 'facebook_profiles'
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    profile_name = Column(String(255), nullable=False, index=True)
    template_id = Column(String(36), ForeignKey('templates.id', ondelete='SET NULL'), nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    template = relationship('Template', back_populates='facebook_profiles')
    outreach_records = relationship('OutreachRecord', back_populates='facebook_profile', cascade='all, delete-orphan')

class Template(Base):
    __tablename__ = 'templates'
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    template_name = Column(String(255), nullable=False, index=True)
    template_content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    facebook_profiles = relationship('FacebookProfile', back_populates='template')
    outreach_records = relationship('OutreachRecord', back_populates='template', cascade='all, delete-orphan')

class OutreachRecord(Base):
    __tablename__ = 'outreach_records'
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    founder_id = Column(String(36), ForeignKey('founders.id', ondelete='CASCADE'), nullable=False, index=True)
    tool_id = Column(String(36), ForeignKey('tools.id', ondelete='CASCADE'), nullable=False, index=True)
    fb_profile_id = Column(String(36), ForeignKey('facebook_profiles.id', ondelete='CASCADE'), nullable=False, index=True)
    template_id = Column(String(36), ForeignKey('templates.id', ondelete='SET NULL'), nullable=True, index=True)
    generated_message = Column(Text, nullable=True)
    status = Column(SQLEnum(OutreachStatus), default=OutreachStatus.MESSAGE_GENERATED, index=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    founder = relationship('Founder', back_populates='outreach_records')
    tool = relationship('Tool', back_populates='outreach_records')
    facebook_profile = relationship('FacebookProfile', back_populates='outreach_records')
    template = relationship('Template', back_populates='outreach_records')
