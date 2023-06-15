document.addEventListener("DOMContentLoaded", () => {
  // Add event listeners for drag start and drag over on order elements
  document.querySelectorAll(".order").forEach((orderElement) => {
    orderElement.addEventListener("dragstart", handleDragStart);
  });

  // Add event listeners for drag start and drag over on column containers
  document.querySelectorAll(".column-container").forEach((columnContainer) => {
    columnContainer.addEventListener("dragstart", handleDragStart);
    columnContainer.addEventListener("dragover", handleDragOver);
    columnContainer.addEventListener("drop", handleDrop);
  });

  // Event handler for drag start
  function handleDragStart(event) {
    event.dataTransfer.setData("text/plain", event.target.dataset.orderId);
    event.dataTransfer.effectAllowed = "move";
    event.target.classList.add("dragging");
  }

  // Event handler for drag over
  function handleDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }

  // Event handler for drop
  function handleDrop(event) {
    event.preventDefault();
    const orderId = event.dataTransfer.getData("text/plain");
    const orderElement = document.querySelector(`[data-order-id="${orderId}"]`);
    const currentColumn = orderElement.parentNode;
    const targetColumn = event.currentTarget;

    if (currentColumn !== targetColumn) {
      targetColumn.appendChild(orderElement);
      orderElement.dataset.column = targetColumn.dataset.column;
    } else {
      const orders = Array.from(targetColumn.querySelectorAll(".order"));
      const currentIndex = orders.indexOf(orderElement);
      const targetIndex = getTargetIndex(event.clientY, orders, currentIndex);
      if (targetIndex !== -1 && targetIndex !== currentIndex) {
        targetColumn.insertBefore(orderElement, orders[targetIndex]);
      }
    }

    orderElement.classList.remove("dragging");
  }

  // Function to get the index at which the element should be inserted
  function getTargetIndex(mouseY, orders, currentIndex) {
    let targetIndex = -1;
    for (let i = 0; i < orders.length; i++) {
      const rect = orders[i].getBoundingClientRect();
      const middleY = rect.top + rect.height / 2;
      if (mouseY < middleY && i !== currentIndex) {
        targetIndex = i;
        break;
      }
    }
    return targetIndex;
  }

  // Rest of the code...

});
document.addEventListener("DOMContentLoaded", () => {
  // Help Overlay
  const helpButton = document.querySelector("[data-help]");
  const helpOverlay = document.querySelector("[data-help-overlay]");
  const helpCloseButton = document.querySelector("[data-help-cancel]");

  helpButton.addEventListener("click", () => {
    helpOverlay.show();
  });

  helpCloseButton.addEventListener("click", () => {
    helpOverlay.close();
    helpButton.focus();
  });

  // Add Order Overlay
  const addOrderButton = document.querySelector("[data-add]");
  const addOrderOverlay = document.querySelector("[data-add-overlay]");
  const addOrderCancel = document.querySelector("[data-add-cancel]");
  const addOrderForm = document.querySelector("[data-add-form]");

  addOrderButton.addEventListener("click", () => {
    addOrderOverlay.show();
  });

  addOrderCancel.addEventListener("click", () => {
    addOrderOverlay.close();
    addOrderButton.focus();
  });

  addOrderForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.target;
    const titleInput = form.querySelector("[data-add-title]");
    const tableSelect = form.querySelector("[data-add-table]");

    const newOrder = {
      id: Date.now(),
      title: titleInput.value,
      table: tableSelect.value,
      column: "ordered",
      created: Date.now(),
    };

    // Add the new order to the "Ordered" column
    addOrder(newOrder);

    form.reset();
    addOrderOverlay.close();
    addOrderButton.focus();
  });

  // Edit Order Overlay
  const editOrderOverlay = document.querySelector("[data-edit-overlay]");
  const editOrderCancel = document.querySelector("[data-edit-cancel]");
  const editOrderDelete = document.querySelector("[data-edit-delete]");
  const editOrderForm = document.querySelector("[data-edit-form]");

  editOrderCancel.addEventListener("click", () => {
    editOrderOverlay.close();
    resetEditForm();
  });

  editOrderDelete.addEventListener("click", () => {
    const orderId = editOrderForm.querySelector("[data-edit-id]").value;

    // Delete the order
    deleteOrder(orderId);

    editOrderOverlay.close();
    resetEditForm();
  });

  editOrderForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.target;
    const orderId = form.querySelector("[data-edit-id]").value;
    const titleInput = form.querySelector("[data-edit-title]");
    const tableSelect = form.querySelector("[data-edit-table]");
    const columnSelect = form.querySelector("[data-edit-column]");

    const updatedOrder = {
      id: orderId,
      title: titleInput.value,
      table: tableSelect.value,
      column: columnSelect.value,
    };

    // Update the order
    updateOrder(updatedOrder);

    editOrderOverlay.close();
    resetEditForm();
  });

  // Function to add a new order to the column
  function addOrder(order) {
    // Add the order to the respective column
    const column = document.querySelector(`[data-column="${order.column}"]`);

    if (column) {
      const orderElement = document.createElement("div");
      orderElement.classList.add("order");
      orderElement.setAttribute("draggable", "true");

      // Create an inner HTML structure for the order element
      orderElement.innerHTML = `
        <div class="order-title">${order.title}</div>
        <div class="order-info">
          <span class="order-status">${order.column}</span>
          <span class="order-timestamp">${formatTimestamp(
        order.created
      )}</span>
        </div>
      `;

      // Add a data attribute to store the order ID
      orderElement.dataset.orderId = order.id;

      column.appendChild(orderElement);

      // Add event listeners for drag and drop functionality
      orderElement.addEventListener("dragstart", handleDragStart);
      orderElement.addEventListener("dragover", handleDragOver);
      orderElement.addEventListener("drop", handleDrop);
      orderElement.addEventListener("dragend", handleDragEnd);
      orderElement.addEventListener("dblclick", handleOrderDoubleClick);
    }
  }

  // Function to delete an order
  function deleteOrder(orderId) {
    // Find the order element
    const orderElement = document.querySelector(
      `[data-order-id="${orderId}"]`
    );

    if (orderElement) {
      // Remove the order element from the column
      const column = orderElement.parentNode;
      column.removeChild(orderElement);
    }
  }

  // Function to update an order
  function updateOrder(updatedOrder) {
    // Find the order element
    const orderElement = document.querySelector(
      `[data-order-id="${updatedOrder.id}"]`
    );

    if (orderElement) {
      // Update the order text
      orderElement.querySelector(".order-title").textContent =
        updatedOrder.title;

      // Update the data attributes
      orderElement.dataset.table = updatedOrder.table;
      orderElement.dataset.column = updatedOrder.column;

      // Update the table select value in the edit order form
      const form = editOrderForm;
      const tableSelect = form.querySelector("[data-edit-table]");
      tableSelect.value = updatedOrder.table;
    }
  }

  // Function to reset the edit form inputs
  function resetEditForm() {
    const form = editOrderForm;
    const titleInput = form.querySelector("[data-edit-title]");
    const tableSelect = form.querySelector("[data-edit-table]");
    const columnSelect = form.querySelector("[data-edit-column]");

    titleInput.value = "";
    tableSelect.value = "";
    columnSelect.value = "ordered";
  }

  // Event handler for drag start
  function handleDragStart(event) {
    // Add the necessary data to the drag event
    event.dataTransfer.setData("text/plain", event.target.dataset.orderId);
    event.dataTransfer.effectAllowed = "move";
    event.target.classList.add("dragging");
  }

  // Event handler for drag over
  function handleDragOver(event) {
    // Prevent the default behavior of the drag over event
    event.preventDefault();

    // Add the necessary drop effect
    event.dataTransfer.dropEffect = "move";
  }

  // Event handler for drop
  function handleDrop(event) {
    // Get the dragged order ID from the data transfer
    const orderId = event.dataTransfer.getData("text/plain");

    // Find the order element and its current column
    const orderElement = document.querySelector(
      `[data-order-id="${orderId}"]`
    );
    const currentColumn = orderElement.parentNode;

    // Find the target column
    const targetColumn = event.currentTarget.parentNode;

    // Check if the target column is different from the current column
    if (currentColumn !== targetColumn) {
      // Move the order to the target column
      targetColumn.appendChild(orderElement);

      // Update the order's column data attribute
      orderElement.dataset.column = targetColumn.dataset.column;
    }

    // Remove the dragging class from the order element
    orderElement.classList.remove("dragging");
  }

  // Event listener for drag start on orders
document.querySelectorAll(".order").forEach((orderElement) => {
  orderElement.addEventListener("dragstart", handleDragStart);
});

// Event listeners for drag and drop on columns
document.querySelectorAll(".column").forEach((columnElement) => {
  columnElement.addEventListener("dragover", handleDragOver);
  columnElement.addEventListener("drop", handleDrop);
});

// Event handler for drag start
function handleDragStart(event) {
  // Add the necessary data to the drag event
  event.dataTransfer.setData("text/plain", event.target.dataset.orderId);
  event.dataTransfer.effectAllowed = "move";
  event.target.classList.add("dragging");
}

// Event handler for drag over
function handleDragOver(event) {
  // Prevent the default behavior of the drag over event
  event.preventDefault();

  // Check if the target column is different from the current column
  if (event.currentTarget !== event.target) {
    // Add the necessary drop effect
    event.dataTransfer.dropEffect = "move";
  }
}

// Event handler for drop
function handleDrop(event) {
  // Get the dragged order ID from the data transfer
  const orderId = event.dataTransfer.getData("text/plain");

  // Find the order element and its current column
  const orderElement = document.querySelector(`[data-order-id="${orderId}"]`);
  const currentColumn = orderElement.parentNode;

  // Find the target column
  const targetColumn = event.currentTarget;

  // Check if the target column is different from the current column
  if (currentColumn !== targetColumn) {
    // Move the order to the target column
    targetColumn.appendChild(orderElement);

    // Update the order's column data attribute
    orderElement.dataset.column = targetColumn.dataset.column;
  }

  // Remove the dragging class from the order element
  orderElement.classList.remove("dragging");
}

  // Event handler for drag end
  function handleDragEnd(event) {
    // Remove the dragging class from the order element
    event.target.classList.remove("dragging");
  }

  // Event handler for double click on an order
  function handleOrderDoubleClick(event) {
    const orderElement = event.currentTarget;
    const orderId = orderElement.dataset.orderId;
    const orderTitle = orderElement.querySelector(".order-title").textContent;
    const orderTable = orderElement.dataset.table;
    const orderColumn = orderElement.dataset.column;

    // Event handler for drag over
function handleDragOver(event) {
  // Prevent the default behavior of the drag over event
  event.preventDefault();

  // Check if the target column is different from the current column
  if (event.currentTarget.parentNode !== event.target.parentNode) {
    // Add the necessary drop effect
    event.dataTransfer.dropEffect = "move";
  }
}
// Event handler for drop
function handleDrop(event) {
  // Get the dragged order ID from the data transfer
  const orderId = event.dataTransfer.getData("text/plain");

  // Find the order element and its current column
  const orderElement = document.querySelector(`[data-order-id="${orderId}"]`);
  const currentColumn = orderElement.parentNode;

  // Find the target column
  const targetColumn = event.currentTarget.parentNode;

  // Check if the target column is different from the current column
  if (currentColumn !== targetColumn) {
    // Move the order to the target column
    targetColumn.insertBefore(orderElement, event.target);

    // Update the order's column data attribute
    orderElement.dataset.column = targetColumn.dataset.column;
  }

  // Remove the dragging class from the order element
  orderElement.classList.remove("dragging");
}


    // Fill the edit order form with the order details
    const form = editOrderForm;
    form.querySelector("[data-edit-id]").value = orderId;
    form.querySelector("[data-edit-title]").value = orderTitle;
    form.querySelector("[data-edit-table]").value = orderTable;
    form.querySelector("[data-edit-column]").value = orderColumn;

    // Show the edit order overlay
    editOrderOverlay.show();
  }

  // Utility function to format timestamps
  function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString();
  }
});
document.addEventListener("DOMContentLoaded", () => {
  // ...existing code...

  // Event listener for drag start on orders
  document.querySelectorAll(".order").forEach((orderElement) => {
    orderElement.addEventListener("dragstart", handleDragStart);
  });

  // Event listeners for drag and drop on columns
  document.querySelectorAll(".column").forEach((columnElement) => {
    columnElement.addEventListener("dragover", handleDragOver);
    columnElement.addEventListener("drop", handleDrop);
  });

  // Event handler for drag start
  function handleDragStart(event) {
    event.dataTransfer.setData("text/plain", event.target.dataset.orderId);
    event.dataTransfer.effectAllowed = "move";
    event.target.classList.add("dragging");
  }

  // Event handler for drag over
  function handleDragOver(event) {
    event.preventDefault();

    // Add the necessary drop effect
    event.dataTransfer.dropEffect = "move";
  }

  // Event handler for drop
  function handleDrop(event) {
    event.preventDefault();

    const orderId = event.dataTransfer.getData("text/plain");
    const orderElement = document.querySelector(`[data-order-id="${orderId}"]`);
    const currentColumn = orderElement.parentNode;
    const targetColumn = event.currentTarget;

    if (currentColumn !== targetColumn) {
      targetColumn.appendChild(orderElement);
      orderElement.dataset.column = targetColumn.dataset.column;
    }

    orderElement.classList.remove("dragging");
  }

  // ...existing code...
});
