import { Outlet } from "react-router-dom";
import { selectActiveStep, selectAllSteps } from "../../features/setup/setupSlice";
import { useAppSelector } from "../../app/hooks";

type SetupStepBoxProps = {
  step: string;
  active?: boolean;
  finished?: boolean;
};

const SetupStepBox = ({ step, active, finished }: SetupStepBoxProps) => {
  let bg = "bg-gray-800";
  if (active) {
    bg = "bg-blue-700";
  } else if (finished) {
    bg = "bg-green-700";
  }
  return (
    <div className={`h-12 font-bold font-roboto ${bg} rounded-md flex pr-10 pl-10`}>
      <h2 className="text-2xl self-center dark:text-white">{step}</h2>
    </div>
  );

}

const Main = () => {
  const renderStepBoxes = () => {
    const steps = useAppSelector(selectAllSteps);
    const activeStep = useAppSelector(selectActiveStep);
    return steps.map((step, index) => {
      const active = step.id === activeStep;
      return <SetupStepBox key={index} step={step.title} active={active} finished={step.completed} />;
    });
  }

  return (
    <div className="dark:bg-gray-900 h-screen w-screen flex justify-center">
      <div className="flex self-center gap-2">
        <div className="flex flex-col gap-2">
          {renderStepBoxes()}
        </div>
        <div className="dark:bg-gray-800 p-4 rounded-md min-w-96">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white font-roboto text-center">First time setup</h1>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default Main;