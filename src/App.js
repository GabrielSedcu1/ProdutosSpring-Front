import React, { useEffect, useState } from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";

const API_URL = "http://localhost:9090/product";

function App() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ id: "", name: "", price: "" });
  const [loading, setLoading] = useState(false);

  const loadProducts = async () => {
    try {
      const res = await axios.get(API_URL);
      setProducts(res.data);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const priceInCents = Math.round(parseFloat(form.price.replace(",", ".")) * 100);

    if (!form.name.trim()) {
      alert("Informe o nome do produto.");
      setLoading(false);
      return;
    }

    if (isNaN(priceInCents) || priceInCents <= 0) {
      alert("Informe um preço válido maior que zero.");
      setLoading(false);
      return;
    }

    const payload = {
      id: form.id || undefined,
      name: form.name,
      priceInCents: priceInCents,
    };

    try {
      if (form.id) {
        await axios.put(API_URL, payload);
      } else {
        await axios.post(API_URL, payload);
      }
      setForm({ id: "", name: "", price: "" });
      loadProducts();
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
      alert("Erro ao salvar produto: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setForm({
      id: product.id,
      name: product.name,
      price: (product.priceInCents / 100).toFixed(2).replace(".", ","),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir este produto?")) return;

    try {
      await axios.delete(`${API_URL}/${id}`);
      loadProducts();
    } catch (error) {
      console.error("Erro ao deletar produto:", error);
      alert("Erro ao deletar produto");
    }
  };

  return (
    <div className="App container mt-5">
      <div className="card shadow p-4 mb-5">
        <h2 className="text-center mb-4 text-primary">💼 Gerenciador de Produtos</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Nome do Produto</label>
            <input
              type="text"
              className="form-control"
              placeholder="Digite o nome"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Preço (R$)</label>
            <input
              type="text"
              className="form-control"
              placeholder="Ex: 10,50"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
              pattern="^\d+([,\.]\d{1,2})?$"
              title="Informe um valor válido, ex: 10,50"
            />
          </div>

          <button
            className="btn btn-primary w-100"
            type="submit"
            disabled={loading}
          >
            {form.id ? "Atualizar Produto" : "Cadastrar Produto"}
          </button>
        </form>
      </div>

      <div className="product-list">
        <h4 className="mb-3 text-secondary">📋 Produtos Cadastrados</h4>
        {products.length === 0 ? (
          <p className="text-muted">Nenhum produto cadastrado ainda.</p>
        ) : (
          <ul className="list-group">
            {products.map((p) => (
              <li
                key={p.id}
                className="list-group-item d-flex justify-content-between align-items-center shadow-sm"
              >
                <div>
                  <strong>{p.name}</strong>
                  <br />
                  <span className="text-muted">
                    R$ {(p.priceInCents / 100).toFixed(2).replace(".", ",")}
                  </span>
                </div>
                <div>
                  <button
                    className="btn btn-sm btn-outline-primary me-2"
                    onClick={() => handleEdit(p)}
                  >
                    Editar
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDelete(p.id)}
                  >
                    Excluir
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default App;
