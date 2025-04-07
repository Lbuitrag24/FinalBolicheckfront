import React, { useState, useEffect } from "react";
import fetchWithAuth from "../../hooks/fetchwithauth";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import ReactPaginate from "react-paginate";
import { MoonLoader } from "react-spinners";
import { motion } from "framer-motion";

const ClientPrizeList = () => {
  useEffect(() => {
    document.title = "Premios | Bolicheck";
  }, []);
  const [cart2, setCart2] = useState({ prizes: [] });
  const [prizes, setPrizes] = useState([]);
  const [loading, setLoading] = useState(true);
  const userPoints = parseInt(localStorage.getItem("points"), 10);
  const ITEMS_PER_PAGE = 15;
  const [currentPage, setCurrentPage] = useState(0);
  const offset = currentPage * ITEMS_PER_PAGE;
  const currentItems = prizes.slice(offset, offset + ITEMS_PER_PAGE);
  const pageCount = Math.ceil(prizes.length / ITEMS_PER_PAGE);
  const startIndex = prizes.length === 0 ? 0 : offset + 1;
  const endIndex = offset + currentItems.length;

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  useEffect(() => {
    const storedCart2 = localStorage.getItem("cart2");
    if (storedCart2) {
      setCart2(JSON.parse(storedCart2));
    }
  }, []);

  useEffect(() => {
    const fetchUserPoints = async () => {
      try {
        const response = await fetchWithAuth(
          "https://bolicheck.onrender.com/api/users/points/",
          {
            method: "GET",
          }
        );
        if (response.ok) {
          const data = await response.json();
          localStorage.setItem("points", data.points);
        } else {
          toast.error("Error al obtener tus puntos, recarga la página.");
        }
      } catch {
        toast.error(
          "Error al obtener tus puntos, estás conectado a internet?."
        );
      } finally {
        setLoading(false);
      }
    };
    const fetchPrizes = async () => {
      try {
        const response = await fetchWithAuth(
          "https://bolicheck.onrender.com/api/prizes/",
          {
            method: "GET",
          }
        );

        if (response.ok) {
          const data = await response.json();
          setPrizes(data);
        } else {
          toast.error("Error al obtener los premios, recarga la página.");
        }
      } catch (error) {
        toast.error(
          "Error al obtener los premios, estás conectado a internet?."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchUserPoints();
    fetchPrizes();
  }, []);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -100 }}
        transition={{ duration: 0.3 }}
      >
        <div className="client-form p-3 col-9 mx-auto rounded-4 gap-3 d-flex flex-column">
          <h1 className="mt-3 text-center col-12">
            Lista de{" "}
            <span className="client-prizes-text-decorate">Premios</span>
          </h1>
          <div className="client-loader">
            <MoonLoader color="#FFF" size={50} speedMultiplier={0.8} />
          </div>
        </div>
      </motion.div>
    );
  }

  const addToCart = (prize, quantity) => {
    const prizeExists = cart2.prizes.some((item) => item.id === prize.id);
    if (prizeExists) {
      const updatedCart = {
        ...cart2,
        prizes: cart2.prizes.map((item) =>
          item.id === prize.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        ),
      };
      setCart2(updatedCart);
      localStorage.setItem("cart2", JSON.stringify(updatedCart));
    } else {
      const updatedCart = {
        ...cart2,
        prizes: [...cart2.prizes, { ...prize, quantity }],
      };
      setCart2(updatedCart);
      localStorage.setItem("cart2", JSON.stringify(updatedCart));
    }
    toast.success(
      `El premio '${prize.name}' x ${quantity} ha sido agregado al carrito.`
    );
  };

  return (
    <div className="col-12 col-lg-10 mx-auto h-auto rounded-4 client-form">
      <div className="d-flex flex-column justify-content-between">
        <h1 className="mt-3 text-center col-12">
          Lista de <span className="client-prizes-text-decorate">Premios</span>
        </h1>
        <h6 className="mt-3 text-center">Tienes: {userPoints} pts.</h6>
      </div>
      <div className="row mt-4 col-8 mx-auto justify-content-center">
        {currentItems.length > 0 ? (
          currentItems.map((prize, index) => {
            return (
              <div
                className="col-sm-12 col-md-5 col-xl-4 mb-4 mb-4"
                key={index}
              >
                <div
                  className={`${
                    prize.is_available
                      ? "client-prizes-card"
                      : "client-card-blocked"
                  } card h-100`}
                >
                  <div className="card-body d-flex flex-column justify-content-between">
                    <div
                      className={`d-flex justify-content-center align-items-center text-center ${
                        prize.is_available
                          ? "circle-prizes-points"
                          : "circle-points-blocked"
                      }`}
                    >
                      <span style={{ color: "white", fontWeight: "bold" }}>
                        {prize.required_points} pts
                      </span>
                    </div>
                    <div className="d-flex flex-column mt-3">
                      <img
                        src={prize.image}
                        alt={prize.name}
                        className={`card-img-top product-image ${
                          !prize.is_available || prize.stock <= 0
                            ? "grayscale"
                            : ""
                        }`}
                        style={{
                          objectFit: "cover",
                          width: "100%",
                          height: "250px",
                          borderRadius: "10px",
                        }}
                      />
                      <h5 className="mt-2 text-center">{prize.name}</h5>
                      <h6 className="text-center">Stock: {prize.stock}</h6>
                      <p
                        className={`text-center ${
                          prize.is_available
                            ? "stext-secondary-stroke"
                            : "stext-thirdary"
                        }`}
                      >
                        {prize.is_available && prize.stock > 0
                          ? "Disponible"
                          : "No disponible"}
                      </p>
                      <p className="text-center">{prize.description}</p>
                      {prize.is_available && prize.stock > 0 ? (
                        <div className="d-flex justify-content-center gap-3">
                          <input
                            type="number"
                            min="1"
                            defaultValue="1"
                            id={`quantity-${prize.id}`}
                            className="client-prizes-mini-input form-control"
                            style={{ width: "60px" }}
                          />
                          <button
                            disabled={userPoints < prize.required_points}
                            onClick={() =>
                              addToCart(
                                prize,
                                parseInt(
                                  document.getElementById(
                                    `quantity-${prize.id}`
                                  ).value
                                )
                              )
                            }
                            className={`btn client-prizes-primary-btn col`}
                            style={{ marginLeft: 0 }}
                          >
                            Redimir
                          </button>
                        </div>
                      ) : (
                        <h6 className="text-center" style={{ color: "white" }}>
                          Este premio no está disponible
                        </h6>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center col-12 mb-4">No hay premios aún.</div>
        )}
      </div>
      <p className="text-center">
        Mostrando {startIndex}–{endIndex} de {prizes.length} resultado(s)
      </p>
      <ReactPaginate
        breakLabel="..."
        nextLabel="Siguiente >"
        onPageChange={handlePageClick}
        pageRangeDisplayed={3}
        pageCount={pageCount}
        previousLabel="< Anterior"
        renderOnZeroPageCount={null}
        containerClassName="pagination justify-content-center mt-4 custom-paginate"
        pageClassName="page-item"
        pageLinkClassName="page-link custom-page-link"
        previousClassName="page-item"
        previousLinkClassName="page-link custom-page-link"
        nextClassName="page-item"
        nextLinkClassName="page-link custom-page-link"
        activeClassName="active custom-active"
      />
    </div>
  );
};

export default ClientPrizeList;
