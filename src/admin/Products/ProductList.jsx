import React, { useState, useEffect } from "react";
import fetchWithAuth from "../../hooks/fetchwithauth";
import ReactPaginate from "react-paginate";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import useConfirmToast from "../../hooks/confirmToast";
import useInformToast from "../../hooks/informToast";
import useInputToast from "../../hooks/inputToast";
import { MoonLoader } from "react-spinners";
import { Link } from "react-router-dom";

const ProductList = () => {
  useEffect(() => {
    document.title = "Productos | Bolicheck";
  }, []);
  const inputToast = useInputToast();
  const confirmToast = useConfirmToast();
  const informToast = useInformToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [waitingInput, setWaitingInput] = useState(false);
  const [loadingReport, setLoadingReport] = useState(false);
  const [open, setOpen] = useState(false);
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
  const fetchProducts = async () => {
    try {
      const response = await fetchWithAuth(
        "https://bolicheck.onrender.com/api/products/",
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

  useEffect(() => {
    const toastShown = localStorage.getItem("toast_shown_once");
    if (products.length > 0 && !toastShown) {
      const productsNotAvailable = products
        .filter((product) => !product.is_available)
        .map((product) => product.name);
      if (productsNotAvailable.length > 0) {
        informToast({
          message: "Estos productos se encuentran inhabilitados: ",
          list: productsNotAvailable,
          postMessage: "Revisa su stock y categoría asociada.",
        });
        localStorage.setItem("toast_shown_once", "true");
      }
    }
  }, [products]);

  const handleDelete = async (id) => {
    const confirmed = await confirmToast(
      "Realmente quieres cambiar el estado del producto?"
    );
    if (!confirmed) {
      return;
    }
    try {
      const response = await fetchWithAuth(
        `https://bolicheck.onrender.com/api/products/${id}/changestate/`,
        {
          method: "POST",
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
        "Ha ocurrido un error al eliminar el producto, estás conectado a internet?"
      );
    }
  };
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
            `https://bolicheck.onrender.com/api/products/${product.id}/add/`,
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
  const handleOffer = async (product) => {
    setWaitingInput(true);
    const offeredPrice = await inputToast(
      `El precio actual del producto ${
        product.name
      } es $${product.price.toLocaleString()}, ¿a qué precio piensas dejarlo?`
    );
    if (offeredPrice === null || offeredPrice.trim() === "") {
      setWaitingInput(false);
      return;
    }
    const parsedOfferedPrice = parseInt(offeredPrice);
    const parsedProductPrice = parseInt(product.price);
    if (isNaN(parsedOfferedPrice)) {
      toast.error("Por favor, ingresa un número válido.");
      setWaitingInput(false);
      return;
    }
    if (parsedOfferedPrice < 0) {
      toast.error("El valor de la oferta no puede ser menor a 0.");
      setWaitingInput(false);
      return;
    }
    if (parsedOfferedPrice > parsedProductPrice) {
      toast.error(
        "El precio ofertado que has colocado supera el precio actual del producto, no es una oferta."
      );
      setWaitingInput(false);
      return;
    }
    if (parsedOfferedPrice === 0) {
      const confirmed = await confirmToast(
        "¿Realmente quieres hacer este producto gratuito?"
      );
      if (!confirmed) {
        setWaitingInput(false);
        return;
      }
    }
    try {
      const response = await fetchWithAuth(
        `https://bolicheck.onrender.com/api/products/${product.id}/offer/`,
        {
          method: "POST",
          body: JSON.stringify({ offeredPrice: parseInt(parsedOfferedPrice) }),
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
    } catch (error) {
      console.error("Error en la solicitud:", error);
      toast.error(
        "Ha ocurrido un error al ofertar el producto, ¿estás conectado a internet?"
      );
    } finally {
      setWaitingInput(false);
    }
  };
  const handleEndOffer = async (product) => {
    setWaitingInput(true);
    const confirmed = await confirmToast(
      "¿Realmente quieres terminar la oferta de este producto?"
    );
    if (!confirmed) {
      setWaitingInput(false);
      return;
    }
    try {
      const response = await fetchWithAuth(
        `https://bolicheck.onrender.com/api/products/${product.id}/endoffer/`,
        {
          method: "POST",
        }
      );
      const data = await response.json();
      if (response.ok) {
        fetchProducts();
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error en la solicitud:", error);
      toast.error(
        "Ha ocurrido un error al agregar unidades al producto, ¿estás conectado a internet?"
      );
    } finally {
      setWaitingInput(false);
    }
  };
  const openModal = (history) => {
    console.log(history);
    setSearchTerm("");
    setHistory(history);
    setIsModalVisible(true);
  };
  const filteredHistory = history.filter((history) => {
    const formattedDate = new Date(history.date).toLocaleString("es-MX", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
    return (
      history.kind.toLowerCase().includes(searchTerm.toLocaleLowerCase()) ||
      history.date.includes(searchTerm) ||
      history?.by?.username?.includes(searchTerm) ||
      String(history.sale).includes(searchTerm) ||
      formattedDate.includes(searchTerm)
    );
  });
  const handleInventoryReport = async () => {
    setOpen(false);
    setLoadingReport(true);
    try {
      toast.info("Generando el reporte, danos un momento...");
      const response = await fetchWithAuth(
        `https://bolicheck.onrender.com/api/products/inventory_report/`,
        {
          method: "POST",
        }
      );
      if (response.ok) {
        const pdfBlob = await response.blob();
        const pdfUrl = URL.createObjectURL(pdfBlob);
        window.open(pdfUrl, "_blank");
      } else {
        const data = await response.json();
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(
        "No ha sido posible generar el reporte, estás conectado a internet?"
      );
    } finally {
      setLoadingReport(false);
    }
  };

  const handleBestSellersReport = async () => {
    setOpen(false);
    setLoadingReport(true);
    try {
      toast.info("Generando el reporte, danos un momento...");
      const response = await fetchWithAuth(
        `https://bolicheck.onrender.com/api/products/best_sellers_report/`,
        {
          method: "POST",
        }
      );
      if (response.ok) {
        const pdfBlob = await response.blob();
        const pdfUrl = URL.createObjectURL(pdfBlob);
        window.open(pdfUrl, "_blank");
      } else {
        const data = await response.json();
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(
        "No ha sido posible generar el reporte, estás conectado a internet?"
      );
    } finally {
      setLoadingReport(false);
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -100 }}
        transition={{ duration: 0.3 }}
      >
        <div className="form-style col-9 mx-auto rounded-4 gap-3 d-flex flex-column">
          <div className="d-flex justify-content-between">
            <div className="dropdown mt-4 mx-auto col-3">
              <button
                className={`btn secondary-btn-style text-truncate dropdown-toggle w-100 ${
                  loading ? "disabled2" : ""
                }`}
                type="button"
                onClick={() => setOpen(!open)}
                disabled={loadingReport || loading}
              >
                Generar reporte
              </button>
            </div>
            <h1 className="mt-3 text-center col-lg-3">Lista de Productos</h1>
            <Link
              to={loading ? "#" : "/admin/products/new"}
              onClick={(e) => loading && e.preventDefault()}
              className={`btn new-btn-style col-3 mx-auto h-25 mt-4 text-truncate`}
            >
              Nuevo Producto
            </Link>
          </div>
          <div className="client-loader">
            <MoonLoader color="#FFF" size={50} speedMultiplier={0.8} />
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      {isModalVisible && (
        <div className="d-flex justify-content-center align-items-center event-modal">
          <div
            className="rounded-3 history-form-style shadow-lg p-4 col-10 col-md-8 col-lg-4"
            style={{ maxHeight: "80vh", overflowY: "auto" }}
          >
            <div className="d-flex justify-content-center">
              <h2 className="text-center mb-4 col-10">Historial</h2>
              <button
                className="btn delete-btn-style h-25"
                onClick={() => setIsModalVisible(false)}
              >
                Cerrar
              </button>
            </div>
            <input
              type="text"
              placeholder="Busca un registro por su tipo, fecha, encargado o venta."
              className="form-control w-75 mx-auto mb-3 inner-input-style"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <ul className="list-unstyled">
              {filteredHistory.length > 0 ? (
                filteredHistory.map((history, index) => (
                  <li
                    key={history.id}
                    className="history-card mb-3 shadow-sm border-0 rounded-3 p-3"
                  >
                    <div className="d-flex align-items-center">
                      <div
                        className="d-flex justify-content-center align-items-center flex-shrink-0 rounded-circle text-white me-3"
                        style={{
                          width: "40px",
                          height: "40px",
                          backgroundColor:
                            history.kind === "HABILITACION"
                              ? "#109B00"
                              : history.kind === "CREACION"
                              ? "#000000"
                              : history.kind === "INHABILITACION"
                              ? "#D80F0F"
                              : history.kind === "ENTRADA"
                              ? "#8600EC"
                              : history.kind === "SALIDA"
                              ? "#0084FF"
                              : history.kind === "EDICION"
                              ? "#444444"
                              : history.kind === "OFERTA"
                              ? "#FF6F00"
                              : history.kind === "FIN OFERTA"
                              ? "#002FFF"
                              : "gray",
                          fontSize: "2rem",
                        }}
                      >
                        {history.kind === "HABILITACION" ? (
                          <i className="bx bx-up-arrow-circle"></i>
                        ) : history.kind === "CREACION" ? (
                          <i className="bx bx-plus-circle"></i>
                        ) : history.kind === "INHABILITACION" ? (
                          <i className="bx bx-down-arrow-circle"></i>
                        ) : history.kind === "ENTRADA" ? (
                          <i className="bx bx-log-in-circle"></i>
                        ) : history.kind === "SALIDA" ? (
                          <i className="bx bx-log-out-circle"></i>
                        ) : history.kind === "EDICION" ? (
                          <i className="bx bx-info-circle"></i>
                        ) : history.kind === "OFERTA" ? (
                          <i class="bx bxs-offer"></i>
                        ) : history.kind === "FIN OFERTA" ? (
                          <i class="bx bxs-offer"></i>
                        ) : (
                          ""
                        )}
                      </div>
                      <div>
                        <h5 className="mb-1 text-capitalize">
                          {history.kind.toLowerCase()} -{" "}
                          {new Date(
                            history.date.replace(" ", "T")
                          ).toLocaleString("es-MX", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </h5>
                        <p style={{ color: "#939393" }} className="mb-1">
                          {history.description}
                        </p>
                        {history.sale && (
                          <>
                            <small style={{ color: "#0099FF" }}>
                              Venta #{history.sale}
                            </small>
                            <br />
                          </>
                        )}
                        {history.by && (
                          <small>
                            Por:{" "}
                            <span style={{ color: "#0099FF" }}>
                              {history.by.username}
                            </span>
                          </small>
                        )}
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <p className="text-center">
                  Tu búsqueda "{searchTerm}" no retornó resultados.
                </p>
              )}
            </ul>
          </div>
        </div>
      )}
      <div className="col-12 col-lg-10 mx-auto h-auto rounded-4 form-style px-4">
        <div className="d-flex justify-content-between">
          <div className="dropdown mt-4 mx-auto col-3">
            <button
              className="btn secondary-btn-style text-truncate dropdown-toggle w-100"
              type="button"
              onClick={() => setOpen(!open)}
              disabled={loadingReport}
            >
              Generar reporte
            </button>
            {open && (
              <ul className="dropdown-menu bg-dark w-100 show d-flex flex-column align-items-stretch">
                <li>
                  <button
                    className="dropdown-item new-btn-style w-75 rounded-3 text-center text-truncate text-white mb-3 mt-2 mx-auto"
                    onClick={handleInventoryReport}
                    disabled={loadingReport}
                  >
                    Inventario
                  </button>
                </li>
                <li>
                  <button
                    className="dropdown-item new-btn-style w-75 rounded-3 text-center text-truncate text-white mx-auto mb-3"
                    onClick={handleBestSellersReport}
                    disabled={loadingReport}
                  >
                    Los + vendidos
                  </button>
                </li>
              </ul>
            )}
          </div>
          <h1 className="mt-3 text-center col-lg-3">Lista de Productos</h1>
          <Link
            to="/admin/products/new"
            className="btn new-btn-style col-3 mx-auto h-25 mt-4 text-truncate"
          >
            Nuevo Producto
          </Link>
        </div>
        <div className="row justify-content-center gap-lg-1 mt-4 mb-4 col-10 mx-auto">
          {currentItems.length > 0 ? (
            currentItems.map((product, index) => (
              <div className="col-12 col-md-8 col-lg-3 mb-4" key={index}>
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
                        <b>{product.name}</b>
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
                        <span style={{ color: "red" }}>
                          {product.min_stock}
                        </span>{" "}
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
                      <Link
                        to={`/admin/products/edit/${product.id}`}
                        className="btn edit-btn-style"
                      >
                        Editar
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className={`btn ${
                          product.is_available
                            ? "delete-btn-style"
                            : "new-btn-style"
                        }`}
                        disabled={waitingInput}
                      >
                        {product.is_available ? "Inabilitar" : "Habilitar"}
                      </button>
                      <button
                        onClick={() => openModal(product.history)}
                        className="btn secondary-btn-style"
                        disabled={waitingInput}
                      >
                        <i className="bx bx-history fs-6"></i>
                      </button>
                    </div>
                  </div>
                  <div className="d-flex mx-auto justify-content-center gap-2 mb-4">
                    <button
                      onClick={() => handleEntry(product)}
                      className="btn yellow-btn-style h-auto col-10"
                      disabled={waitingInput}
                    >
                      Entrada
                    </button>
                    <button
                      onClick={() =>
                        product.offered_price == null
                          ? handleOffer(product)
                          : handleEndOffer(product)
                      }
                      className={`btn ${
                        product.offered_price !== null
                          ? "delete-btn-style"
                          : "new-btn-style"
                      } h-auto col-5`}
                      disabled={waitingInput}
                    >
                      <i className="bx bxs-offer fs-5"></i>
                    </button>
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
    </>
  );
};

export default ProductList;

