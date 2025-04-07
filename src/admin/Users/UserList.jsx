import React, { useState, useEffect } from "react";
import fetchWithAuth from "../../hooks/fetchwithauth";
import ReactPaginate from "react-paginate";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MoonLoader } from "react-spinners";

const UserList = () => {
  useEffect(() => {
    document.title = "Usuarios | Bolicheck";
  }, []);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [loadingReport, setLoadingReport] = useState(false);
  const ITEMS_PER_PAGE = 8;
  const [currentPage, setCurrentPage] = useState(0);
  const offset = currentPage * ITEMS_PER_PAGE;
  const currentItems = users.slice(offset, offset + ITEMS_PER_PAGE);
  const pageCount = Math.ceil(users.length / ITEMS_PER_PAGE);
  const startIndex = users.length === 0 ? 0 : offset + 1;
  const endIndex = offset + currentItems.length;

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  const fetchUsers = async () => {
    try {
      const response = await fetchWithAuth("https://bolicheck.onrender.com/api/users/", {
        method: "GET",
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        toast.error(
          "Ha ocurrido un error al obtener los usuarios, por favor, recarga la página."
        );
      }
    } catch (error) {
      toast.error(
        "Ha ocurrido un error al obtener los usuarios, estás conectado a internet?"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    try {
      const response = await fetchWithAuth(
        `https://bolicheck.onrender.com/api/users/${id}/changestate/`,
        {
          method: "POST",
        }
      );
      const data = await response.json();
      if (response.ok) {
        fetchUsers();
        toast.success(data.message);
      } else {
        toast.error(
          "Ha ocurrido un error al cambiar el estado del usuario, vuélvelo a intentar."
        );
      }
    } catch (error) {
      toast.error(
        "Ha ocurrido un error al cambiar el estado del usuario, estás conectado a internet?"
      );
    }
  };

  const handleEmployeesReport = async () => {
    setOpen(false);
    setLoadingReport(true);
    try {
      toast.info("Generando el reporte, danos un momento...");
      const response = await fetchWithAuth(
        `https://bolicheck.onrender.com/api/users/employees_report/`,
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

  const handleBestCustomersReport = async () => {
    setOpen(false);
    setLoadingReport(true);
    try {
      toast.info("Generando el reporte, danos un momento...");
      const response = await fetchWithAuth(
        `https://bolicheck.onrender.com/api/users/clients_report/`,
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
            <h1 className="text-center col-4 mt-3">Lista de Usuarios</h1>
            <Link
              to="/admin/users/new"
              className="btn new-btn-style col-3 mx-auto h-25 mt-4 text-truncate"
            >
              Nuevo Usuario
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
    <div className="col-12 col-lg-10 mx-auto h-auto rounded-4 form-style">
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
                  onClick={handleEmployeesReport}
                  disabled={loadingReport}
                >
                  Mejores vendedores
                </button>
              </li>
              <li>
                <button
                  className="dropdown-item new-btn-style w-75 rounded-3 text-center text-truncate text-white mx-auto mb-3"
                  onClick={handleBestCustomersReport}
                  disabled={loadingReport}
                >
                  Mejores clientes
                </button>
              </li>
            </ul>
          )}
        </div>
        <h1 className="text-center col-4 mt-3">Lista de Usuarios</h1>
        <Link
          to="/admin/users/new"
          className="btn new-btn-style col-3 mx-auto h-25 mt-4 text-truncate"
        >
          Nuevo Usuario
        </Link>
      </div>
      <ul className="d-flex list-group mt-4 mx-auto">
        {currentItems.length > 0 ? (
          currentItems.map((user, index) => (
            <li
              className="list-group-item d-flex flex-column col-10 mx-auto flex-md-row justify-content-between align-items-center mb-3 card-style"
              key={index}
            >
              <div className="col-12 col-md-6 text-start">
                <h4 className="mb-2 mt-1">{user.username}</h4>
                <p className="mb-0">Email: {user.email}</p>
                <p className="mb-0">ID: {user.identification_number}</p>
                <p className="mb-0">Teléfono: {user.telephone_number}</p>
              </div>
              <div className="btn-group gap-1 mt-3 mb-3 mt-md-0 mb-md-0">
                <Link
                  to={`/admin/users/edit/${user.id}`}
                  className="btn btn-sm secondary-btn-style"
                >
                  Ver
                </Link>
                <Link
                  to={`/admin/users/edit/${user.id}`}
                  className="btn btn-sm new-btn-style"
                >
                  Editar
                </Link>
                <button
                  onClick={() => handleDelete(user.id)}
                  className={`btn btn-sm ${
                    user.is_active ? "delete-btn-style" : "new-btn-style"
                  }`}
                >
                  {user.is_active ? "Inhabilitar" : "Habilitar"}
                </button>
              </div>
            </li>
          ))
        ) : (
          <div className="text-center mt-3 mb-4">
            No hay usuarios registrados aún.
          </div>
        )}
      </ul>
      <br />
      <p className="text-center">
          Mostrando {startIndex}–{endIndex} de {users.length} resultado(s)
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

export default UserList;
