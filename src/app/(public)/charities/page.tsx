export default function Charities() {

  const charities = [
    {
      name: "Education for All",
      description: "Supporting education for underprivileged children."
    },
    {
      name: "Clean Water Initiative",
      description: "Providing safe drinking water to rural communities."
    },
    {
      name: "Tree Plantation Drive",
      description: "Planting trees to fight climate change."
    },
    {
      name: "Children Health Fund",
      description: "Providing healthcare for children in need."
    }
  ];

  return (

    <div className="p-10">

      <h1 className="text-3xl font-bold mb-6">
        Supported Charities
      </h1>

      <p className="mb-8">
        Our platform supports several charities. Monthly winners help raise awareness and contributions for these causes.
      </p>

      <div>

        {charities.map((charity, index) => (

          <div key={index} className="border p-5 mb-4">

            <h2 className="text-xl font-semibold">
              {charity.name}
            </h2>

            <p>
              {charity.description}
            </p>

          </div>

        ))}

      </div>

    </div>

  );

}