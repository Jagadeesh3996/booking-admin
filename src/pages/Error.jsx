
import React from 'react';
import { Link } from 'react-router-dom';

const Error = () => {
  return (<>
    <div id="cbody" className="cbody">
      <div className="concard text-center">
        <h1>404 - Page Not found</h1>
        <Link  to="/">Go to Home</Link>
      </div>
    </div>
  </>);
}

export default Error;