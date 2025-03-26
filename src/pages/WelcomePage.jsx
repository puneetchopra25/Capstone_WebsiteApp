import pure_sim from "../assets/puresim_2_logo-removebg-preview.png";

const WelcomePage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-semibold text-center">
        Welcome to{" "}
        <img
          src={pure_sim}
          alt="Pure Sim Logo"
          className="inline w-64 h-auto"
        />
      </h1>
      {/* <h2 className="text-4xl font-semibold text-center">Simulator</h2> */}
      <h3 className="text-xl font-normal text-center py-1">
        Renewable Energy Assessment Tool for Mine Sites
      </h3>
    </div>
  );
};

export default WelcomePage;
