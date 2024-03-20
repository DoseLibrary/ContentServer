import { PayloadAction } from "@reduxjs/toolkit";
import { createAppSlice } from "../../app/createAppSlice";
import { s } from "vitest/dist/reporters-1evA5lom.js";
import { title } from "process";

enum SetupStep {
  DATBASE = 0,
  USER = 1,
}

interface Database {
  host: string
  port: number
  name: string
  user: string
  password: string
}

interface User {
  name: string
  email: string
  password: string
}

interface Step {
  id: SetupStep;
  title: string;
  description: string;
  completed: boolean;
  data: Database | User;
}

interface SetupSliceState {
  activeStep: SetupStep;
  steps: Step[]; 
}

const initialState: SetupSliceState = {
  activeStep: SetupStep.DATBASE,
  steps: [
    {
      id: SetupStep.DATBASE,
      title: 'Database',
      description: 'Configure the database connection',
      completed: false,
      data: {
        host: '127.0.0.1',
        port: 5432,
        name: '',
        user: 'postgres',
        password: 'postgres',
      }
    },
    {
      id: SetupStep.USER,
      title: 'User',
      description: 'Create the first user',
      completed: false,
      data: {
        name: '',
        email: '',
        password: '',
      }
    }
  ],
}

export const setupSlice = createAppSlice({
  name: 'setup',
  initialState,
  reducers: create => ({
    nextStep: create.reducer((state) => {
      if (state.activeStep < SetupStep.USER) {
        state.activeStep++;
      } else {
        throw new Error('Already at the last step');
      }
    }),
    setStepData: create.reducer((state, action: PayloadAction<{ id: SetupStep, data: Database | User }>) => {
      const step = state.steps.find(step => step.id === action.payload.id);
      if (step) {
        step.data = action.payload.data;
      } else {
        throw new Error('Invalid step id');
      }
    }),
  }),
  selectors: {
    selectActiveStep: state => state.activeStep,
    selectAllSteps: state => state.steps,
    selectDatabase: state => state.steps.find(step => step.id === SetupStep.DATBASE)?.data as Database,
    selectUser: state => state.steps.find(step => step.id === SetupStep.USER)?.data as User,
  }
});

export const { nextStep } = setupSlice.actions;
export const { selectActiveStep, selectDatabase, selectUser, selectAllSteps } = setupSlice.selectors;
