import { useState } from "react";
import { useAppSelector } from "../../app/hooks";
import { Input, SimpleButton } from "../../core";
import { selectDatabase } from "./setupSlice";

const Database = () => {
  const database = useAppSelector(selectDatabase);
  const [host, setHost] = useState(database.host);
  const [port, setPort] = useState(database.port);
  const [user, setUser] = useState(database.user);
  const [password, setPassword] = useState(database.password);
  const [name, setName] = useState(database.name);

  const handleHostChange = (e: React.ChangeEvent<HTMLInputElement>) => setHost(e.target.value);
  const handlePortChange = (e: React.ChangeEvent<HTMLInputElement>) => setPort(parseInt(e.target.value));
  const handleUserChange = (e: React.ChangeEvent<HTMLInputElement>) => setUser(e.target.value);
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value);
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value);

  const tryConnection = () => {
    
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-roboto text-center">Database</h1>
      <form className="flex flex-col gap-4">
        <Input label="Host" placeholder="Host" value={host} onChange={handleHostChange} />
        <Input label="Port" placeholder="Port" value={port.toString()} onChange={handlePortChange} />
        <Input label="Username" placeholder="Username" value={user} onChange={handleUserChange} />
        <Input label="Password" placeholder="Password" value={password} onChange={handlePasswordChange} />
        <Input label="Database Name" placeholder="Database Name" value={name} onChange={handleNameChange} />
        <SimpleButton onClick={tryConnection} >Try connection</SimpleButton>
        <div className="flex justify-between">
          <SimpleButton type="alert" className="px-5">Back</SimpleButton>
          <SimpleButton className="px-5" disabled>Next</SimpleButton>
        </div>
      </form>
    </div>
  )
};

export default Database;
