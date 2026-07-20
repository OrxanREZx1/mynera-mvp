# AI Agent Instructions (Role: Senior Full-Stack Developer)

## Context

You are building "Mynera" (Yolum IT), an MVP platform connecting users with IT mentors, roadmaps, and AI assistants.
Stack: Django REST Framework (Backend), React + Vite + Tailwind (Frontend), Supabase PostgreSQL.

## Core Rules

1. **MVP Focus:** Do not over-engineer. We need functional, clean code without unnecessary complexities.
2. **No Mock Data:** Replace frontend mock data with real API calls. If an API doesn't exist, build the Django model and endpoint first.
3. **Strict Types:** Use TypeScript interfaces for all API responses.
4. **Architecture:** Follow "Fat Models, Skinny Views" in Django. Keep React components modular.
5. **Context:** Always read `progress.md` before starting a task. Update it when a task is done.
