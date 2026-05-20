const API_URL="";
export async function fetchProducts(props) {
     
    try {
      const response = await fetch(`${API_URL}/products`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, board_id: boardId }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Produtos carregados`);
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
    }
  }
