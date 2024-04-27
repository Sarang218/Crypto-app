import "./App.css";
import axios from "axios";
import React, { useEffect, useState } from "react";

function App() {
  const [search, setSearch] = useState("");
  const [crypto, setCrypto] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Number of items to show per page

  useEffect(() => {
    async function fetchData() {
      try {
        const rateResponse = await axios.get(
          "https://rest.coinapi.io/v1/exchangerate/INR",
          {
            headers: {
              "X-CoinAPI-Key": "ec89d462-3f52-44b0-b3e4-757f746d9401",
            },
          }
        );
        const iconResponse = await axios.get(
          "https://rest.coinapi.io/v1/assets/icons/50",
          {
            headers: {
              "X-CoinAPI-Key": "ec89d462-3f52-44b0-b3e4-757f746d9401",
            },
          }
        );

        // Create a map from asset_id_quote to rate for rateResponse
        const rateMap = {};
        rateResponse.data.rates.forEach((rate) => {
          rateMap[rate.asset_id_quote] = rate.rate;
        });

        // Merge icon data with rate data based on asset_id_quote and asset_id
        const mergedCrypto = iconResponse.data.reduce((result, icon) => {
          const rate = rateMap[icon.asset_id];
          if (rate !== undefined) {
            result.push({
              url: icon.url,
              asset_id: icon.asset_id,
              rate: rate,
            });
          }
          return result;
        }, []);
      
        // Update mergedCrypto state
        setCrypto(mergedCrypto);

        setLoading(false);
      } catch (error) {
        console.log(error);
      }
    }

    fetchData();
  }, []);

  const filteredCrypto = crypto.filter((item) =>
    item.asset_id.toLowerCase().includes(search.toLowerCase())
  );

  crypto.sort((a, b) => {
    if (a.rate < b.rate) return -1;
    if (a.rate > b.rate) return 1;
    return 0;
  });

  // Calculate pagination values
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCrypto.slice(indexOfFirstItem, indexOfLastItem);

  

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return <h1>Loading...</h1>;
  }

  return (
    <div className="App">
      <h1>Crypto Hunter</h1>
      <input
        type="text"
        placeholder="Search For a Crypto Currency"
        onChange={(e) => {
          setSearch(e.target.value);
          setCurrentPage(1); // Reset to the first page when searching
        }}
      />
      <table>
        <thead>
          <tr>
            <td>Icon</td>
            <td>Name</td>
            <td>Price</td>
          </tr>
        </thead>
        <tbody>
        {currentItems.map(({ url, asset_id, rate }) => (
        <tr key={asset_id}>
          <td>
            <img src={url} alt={asset_id} style={{ height: "50px" }} />
          </td>
          <td>{asset_id}</td>
          <td>{`${(1 / rate).toFixed(2)} ₹`}</td> {/* Display the rate with the Rupee symbol */}
        </tr>
           ))}
        </tbody>

      </table>
      {/* Pagination */}
      <div className="pagination">
        <button
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        {Array.from({ length: Math.ceil(filteredCrypto.length / itemsPerPage) })
          .slice(
            Math.max(0, currentPage - 3),
            Math.min(
              Math.ceil(filteredCrypto.length / itemsPerPage),
              currentPage + 2
            )
          )
          .map((_, index) => (
            <button
              key={index + Math.max(0, currentPage - 3)}
              onClick={() => paginate(index + Math.max(0, currentPage - 3) + 1)}
              className={currentPage === index + Math.max(0, currentPage - 3) + 1 ? 'active' : ''}
            >
              {index + Math.max(0, currentPage - 3) + 1}
            </button>
          ))}
        <button
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === Math.ceil(filteredCrypto.length / itemsPerPage)}
        >
          Next
        </button>
      </div>
    </div>
  );  

}

export default App;


