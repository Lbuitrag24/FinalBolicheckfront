import React, { useState, useEffect } from "react";
import fetchWithAuth from "../../hooks/fetchwithauth";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import useInputToast from "../../hooks/inputToast";
import useConfirmToast from "../../hooks/confirmToast";
import ReactPaginate from "react-paginate";
import { MoonLoader } from "react-spinners";
import { motion } from "framer-motion";
const EmployeeProductList = () => {
  const inputToast = useInputToast();
  const confirmToast = useConfirmToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [waitingInput, setWaitingInput] = useState(false);
  const ITEMS_PER_PAGE = 6;
  const [currentPage, setCurrentPage] = useState(0);
  const offset = currentPage * ITEMS_PER_PAGE;
  const currentItems = products.slice(offset, offset + ITEMS_PER_PAGE);
  const pageCount = Math.ceil(products.length / ITEMS_PER_PAGE);
  const startIndex = products.length === 0 ? 0 : offset + 1;
  const endIndex = offset + currentItems.length;

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };
  useEffect(() => {
        document.title = "Productos | Bolicheck";
      }, []);
  const fetchProducts = async () => {
    try {
      const response = await fetchWithAuth(
        "http://localhost:8080/api/products/",
        {
          method: "GET",
        }
      );
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        toast.error(
          "Ha ocurrido un error al obtener los productos, por favor, recarga la página."
        );
      }
    } catch {
      toast.error(
        "Ha ocurrido un error al obtener los productos, estás conectado a internet?"
      );
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchProducts();
  }, []);

  const handleEntry = async (product) => {
    setWaitingInput(true);
    const quantity = await inputToast(
      `Cuántas unidades del producto ${product.name} vas a ingresar?`
    );
    if (quantity) {
      if (parseInt(product.stock) + parseInt(quantity) > product.max_stock) {
        toast.error(
          "No puedes registrar más de " +
            (parseInt(product.max_stock) - parseInt(product.stock)) +
            " unidades."
        );
      } else if (parseInt(quantity) <= 0) {
        toast.error(
          "No puedes registrar una cantidad menor o igual a 0 unidades."
        );
      } else {
        try {
          const response = await fetchWithAuth(
            `http://localhost:8080/api/products/${product.id}/add/`,
            {
              method: "POST",
              body: JSON.stringify({ quantity: parseInt(quantity) }),
              headers: { "Content-Type": "application/json" },
            }
          );
          const data = await response.json();
          if (response.ok) {
            fetchProducts();
            toast.success(data.message);
          } else {
            toast.error(data.message);
          }
        } catch {
          toast.error(
            "Ha ocurrido un error al agregar unidades al producto, estás conectado a internet?"
          );
        }
      }
      setWaitingInput(false);
    } else {
      setWaitingInput(false);
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -100 }}
        transition={{ duration: 0.3 }}
      >
        <div className="col-12 col-lg-9 mx-auto h-auto rounded-4 form-style">
          <div className="d-flex justify-content-between">
            <h1 className="mt-3 text-center col-12">Lista de Productos</h1>
          </div>
          <div className="client-loader">
            <MoonLoader color="#FFF" size={50} speedMultiplier={0.8} />
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="col-12 col-lg-9 mx-auto h-auto rounded-4 form-style">
      <div className="d-flex justify-content-between">
        <h1 className="mt-3 text-center col-12">Lista de Productos</h1>
      </div>
      <div className="row mt-4 col-12 gap-1 mx-auto justify-content-center">
        {currentItems.length > 0 ? (
          currentItems.map((product, index) => (
            <div className="col-12 col-md-6 col-lg-3 mb-4" key={index}>
              <div
                className={`card h-100 card-style ${
                  product.is_available ? "products" : "blocked"
                } `}
              >
                <div className="card-body d-flex flex-column justify-content-between">
                  <div
                    className={`d-flex justify-content-center align-items-center ${
                      product.is_available
                        ? "points-badge"
                        : "circle-points-blocked"
                    }`}
                  >
                    <span
                      className="text-center"
                      style={{ color: "white", fontWeight: "bold" }}
                    >
                      {product.points} pts.
                    </span>
                  </div>
                  <div className="d-flex flex-column mt-3">
                    <img
                      src={product.image}
                      alt={product.name}
                      className={`card-img-top ${
                        !product.is_available && "grayscale"
                      }`}
                      style={{
                        objectFit: "cover",
                        width: "100%",
                        height: "300px",
                        borderRadius: "10px",
                      }}
                    />
                    <h5 className="mt-2 text-center text-truncate">
                      {product.name}
                    </h5>
                    <h6
                      className={`text-center ${
                        product.offered_price != null &&
                        "text-secondary text-decoration-line-through"
                      }`}
                    >
                      Precio: ${product.price.toLocaleString()}
                    </h6>
                    {product.offered_price != null && (
                      <h6 className="text-center text-success">
                        Precio (Con descuento):
                        {product.offered_price > 0
                          ? "$" + product.offered_price.toLocaleString()
                          : " Gratis"}
                      </h6>
                    )}
                    <h6 className="text-center">
                      Stock:{" "}
                      <span style={{ color: "red" }}>{product.min_stock}</span>{" "}
                      {product.stock}{" "}
                      <span style={{ color: "green" }}>
                        {product.max_stock}
                      </span>
                    </h6>
                    <p
                      className={`text-center ${
                        !product.is_available ? "text-disabled" : ""
                      }`}
                    >
                      {product.is_available ? "Disponible" : "No disponible"}
                    </p>
                  </div>

                  <div>
                    <p className="text-center">{product.description}</p>
                  </div>

                  <div className="card-actions d-flex justify-content-center gap-2">
                    <button
                      onClick={() => handleEntry(product)}
                      className="btn yellow-btn-style"
                      disabled={waitingInput}
                    >
                      Agregar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center col-12 mb-4">No hay productos aún.</div>
        )}
      </div>
      <p className="text-center">
        Mostrando {startIndex}–{endIndex} de {products.length} resultado(s)
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
export default EmployeeProductList;
