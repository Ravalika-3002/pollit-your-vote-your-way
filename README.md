PollIt — Your Vote, Your Way

PollIt — Online Polling Platform

Project Overview

PollIt is a full-stack online polling platform built for teams and communities to create, manage, share, and participate in polls securely.

The platform allows authenticated users to:


    Create polls
    Publish polls
    Vote on polls
    Share polls using URLs
    Manage public/private visibility
    View poll analytics and aggregate results


The project was developed as part of the Online Polling Platform Challenge.

Features Implemented

Authentication


    User registration
    User login
    User logout
    Session persistence using Supabase Authentication
    Protected routes for authenticated users


Poll Management


    Create polls
    Save polls as drafts
    Publish polls
    Single-choice polls
    Multi-choice polls
    Add multiple options dynamically
    Public / Private visibility selection
    Results visibility configuration
    Optional poll closing date


Poll Lifecycle


    Draft status
    Open status
    Closed status
    Draft editing support
    Publish validation


Poll Feed


    Dashboard
    Public Feed
    My Polls
    Shared with Me


Voting System


    One vote per user
    Vote replacement support
    Aggregate result calculation
    Percentage-based results


Security


    Row Level Security (RLS)
    Supabase Auth protection
    Protected database access
    Authenticated-only access


Database Persistence


    Polls stored permanently in Supabase PostgreSQL
    Votes stored permanently
    Invitations stored permanently
    Profiles stored permanently


Tech Stack

Frontend


    React
    TypeScript
    Vite
    Tailwind CSS
    ShadCN UI


Backend / Database


    Supabase
    PostgreSQL
    Supabase Authentication
    Supabase Row Level Security (RLS)


AI Development Tools Used


    Lovable AI
    VS Code Copilot
    ChatGPT
    Claude
    Trae IDE


Why These Technologies Were Chosen

React + TypeScript

Chosen for:


    Component-based architecture
    Fast UI development
    Type safety
    Better maintainability


Vite

Chosen because:


    Extremely fast development server
    Faster builds compared to CRA
    Excellent React support


Tailwind CSS

Chosen because:


    Rapid UI styling
    Responsive design
    Easy customization


Supabase

Chosen because:


    Built-in Authentication
    PostgreSQL database
    Row Level Security
    Easy API integration
    Real-time-ready backend
    Fast setup for hackathon environment


Architecture Overview

Frontend Structure

src/routes

Contains:


    Dashboard pages
    Authentication pages
    Poll creation pages
    Feed pages


src/components

Reusable UI components:


    Sidebar
    Forms
    Cards
    Poll components
    Buttons


src/lib

Contains:


    Supabase client setup
    Utility functions


src/hooks

Custom React hooks for:


    Authentication
    Poll state management


Database Design

Tables Used

profiles

Stores:


    User ID
    Email
    Display name


polls

Stores:


    Poll title
    Description
    Type
    Visibility
    Status
    Results visibility
    Share token
    Creator
    Dates


poll_options

Stores poll option values.

votes

Stores user vote sets.

vote_options

Stores selected options for multi-choice support.

invitations

Stores invited users for private polls.

API & Backend Flow

Authentication Flow

Signup


    User submits signup form
    Frontend calls Supabase Auth API
    Supabase creates auth user
    Trigger automatically creates profile entry
    Session is created


Login


    User submits credentials
    Supabase verifies credentials
    JWT session token returned
    User redirected to dashboard


Poll Creation Flow


    User fills poll form
    Frontend validates inputs
    Poll inserted into polls table
    Poll options inserted into poll_options
    Share token generated
    Poll appears on dashboard


Voting Flow


    User selects options
    Vote validated
    Previous vote replaced if exists
    Vote count recalculated
    Aggregate results displayed


Supabase Integration

Environment Variables

VITE_SUPABASE_URL=YOUR_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_KEY


Supabase Client

The frontend connects using:

createClient(SUPABASE_URL, SUPABASE_KEY)


This creates a secure connection between:


    React frontend
    Supabase backend


Security Implementation

Row Level Security (RLS)

Implemented using Supabase policies.

Ensures:


    Users access only authorized polls
    Private polls remain protected
    Vote tampering prevention
    One vote per user enforcement


AI Tools Usage

Lovable AI

Used for:


    Initial project scaffolding
    UI generation
    Base structure


VS Code Copilot

Used for:


    Autocomplete
    Function suggestions
    Refactoring assistance


ChatGPT

Used for:


    Debugging
    Architecture guidance
    SQL fixes
    Authentication troubleshooting



Functional Requirements Completed

Completed


    FR1 – User Registration
    FR2 – User Login
    FR3 – Logout
    FR4 – Protected Screens
    FR6 – Poll Creation
    FR7 – Draft Polls
    FR8 – Draft Editing
    FR11 – Poll Status Lifecycle
    FR12 – Publish Poll
    FR17 – Shareable URL
    FR18 – Public Polls
    FR19 – Private Polls
    FR27 – Voting
    FR28 – One Vote Per User
    FR32 – Aggregate Results
    FR34 – Always Visible Results
    FR38 – My Polls
    FR39 – Shared With Me
    FR42 – Persistent Storage
    FR43 – Poll Title Validation
    FR44 – Minimum 2 Options Validation


Partially Completed / Future Improvements


    Invitation revocation
    Advanced pagination
    Auto-close polling
    Full sorting system
    Result hiding until vote completion
    Complete private invite flow


Assumptions


    All users are authenticated users.
    Poll creators are trusted moderators of their polls.
    Email verification was disabled during development for faster hackathon iteration.
    Local deployment is sufficient for evaluation.


Trade-offs

Due to the 6-hour build constraint:


    UI polish was prioritized less than core functionality.
    Real-time updates were skipped.
    Advanced analytics were skipped.
    Notifications were skipped.
    CSV exports were skipped.


Future Work

With more time, the following can be added:


    Real-time live voting updates
    Charts and visual analytics
    Email invitations
    Notifications
    Poll comments
    Docker deployment
    Mobile responsiveness improvements
    Better accessibility
    Search and advanced filters


Setup Instructions

Clone Repository

git clone <repository-url>
cd pollit-your-vote-your-way


Install Dependencies

npm install


Configure Environment Variables

Create .env file:

VITE_SUPABASE_URL=YOUR_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_KEY


Run Application

npm run dev


Application runs on:

http://localhost:8081


Database Setup


    Open Supabase
    Open SQL Editor
    Run migration SQL from:
    supabase/migrations/

    Ensure tables are created:
    
        profiles
        polls
        poll_options
        votes
        vote_options
        invitations
    


Incremental Development

The repository contains:


    Incremental commits
    Feature-wise progress tracking
    Debugging history
    AI-assisted development iterations


Conclusion

PollIt demonstrates a complete end-to-end polling platform with:


    Authentication
    Secure voting
    Poll lifecycle management
    Shareable URLs
    Private/Public access control
    Persistent cloud database storage


The project emphasizes correctness, security, lifecycle handling, and clean architecture over unnecessary complexity.
