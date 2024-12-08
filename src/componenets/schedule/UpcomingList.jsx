
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import { Tooltip } from 'react-tooltip';
import { getUpcomingSchedule, deleteSchedule } from "../../services/api/api";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toolbar } from "primereact/toolbar";
import { Button } from "primereact/button";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { InputText } from "primereact/inputtext";
import { Dialog } from "primereact/dialog";

// import "primereact/resources/themes/mdc-dark-indigo/theme.css";
// import 'primereact/resources/themes/mira/theme.css';
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

const UpcomingList = () => {
  const role = useSelector((state) => state.user.userDetails.UserRole);
  const team_id = useSelector((state) => state.user.userDetails.UserTeamId);
  const theme = useSelector((state) => state.theme.value);
  const [themeName, setthemeName] = useState(
    theme === "dark" ? "mdc-dark-indigo" : "mira"
  );
  const [products, setProducts] = useState();
  const [globalFilter, setGlobalFilter] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState(null);
  const [product, setProduct] = useState({});
  const [productDialog, setProductDialog] = useState(false);
  const [deleteProductDialog, setDeleteProductDialog] = useState(false);
  const [deleteProductsDialog, setDeleteProductsDialog] = useState(false);
  const [loading, setloading] = useState(false);
  const dt = useRef(null);

  // theme change
  useEffect(() => {
    setthemeName(theme === "dark" ? "mdc-dark-indigo" : "mira");
  }, [theme]);
  useEffect(() => {
    const existingTheme = document.getElementById("theme-style");
    if (existingTheme) {
      existingTheme.remove();
    }
    const link = document.createElement("link");
    link.id = "theme-style";
    link.rel = "stylesheet";
    link.href = `https://unpkg.com/primereact/resources/themes/${themeName}/theme.css`;
    document.head.appendChild(link);
  }, [themeName]);

  //   get schedule data
  useEffect(() => {
    const team = (team_id) ? team_id : "All";
    if (role === "Super Admin" || team_id && !productDialog) {
      getUpcomingSchedule(team)
        .then((response) => {
          if (response.status) {
            setProducts(response.data);
          } else {
            setProducts([]);
            toast.warning("No Data to Show !", {
              position: "top-right",
              autoClose: 3000,
            });
          }
        })
        .catch((error) => {
          setProducts([]);
          console.error(error);
        });
    }
  }, [productDialog, team_id]);

  // hide popup
  const hideDialog = () => {
    setProductDialog(false);
  };

  //open view popup
  const viewProduct = (product) => {
    setProduct({ ...product });
    setProductDialog(true);
  };

  // delete one product
  const confirmDeleteProduct = (product) => {
    setProduct(product);
    setDeleteProductDialog(true);
  };

  // close button
  const productDialogFooter = (
    <React.Fragment>
      <Button
        label="Close"
        icon="pi pi-times"
        className="me-2"
        outlined
        onClick={hideDialog}
      />
    </React.Fragment>
  );

  // Custom CSV Export Function
  const exportCustomCSV = (data) => {
    const columnsToRemove = ["id", "event_id", "showroom_id", "team_id", "status", "modified_on"]; // Specify the columns you want to remove
    const headers = Object.keys(data[0]).filter(
      (header) => !columnsToRemove.includes(header)
    );
    const csvRows = [];
    csvRows.push(headers.join(","));
    data.forEach((row) => {
      csvRows.push(headers.map((field) => row[field]).join(","));
    });
    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "upcoming_schedule_data.csv";
    link.click();
  };
  const exportCSV = () => {
    let item = dt.current.props.value;
    let modifiedData = [];
    item.forEach((row, index) => {
      modifiedData.push({
        "s.no": index + 1,
        ...row,
      });
    });
    exportCustomCSV(modifiedData);
  };

  // add and delete button
  const leftToolbarTemplate = () => {
    return (
      <div className="flex flex-wrap gap-2">
        { role === 'Super Admin' && (
          <a href="https://bookingform.bharatmakers.com/" target="_blank">
            <Button
              label="Book"
              icon="pi pi-plus"
              severity="success"
            />
          </a>
        )}
        <Button
          label="Delete"
          icon="pi pi-trash"
          severity="danger"
          onClick={() => setDeleteProductsDialog(true)}
          disabled={!selectedProducts || !selectedProducts.length}
        />
      </div>
    );
  };

  // export button
  const rightToolbarTemplate = () => {
    return (
      <div className="flex flex-wrap gap-2">
        <Button
          label="Export"
          icon="pi pi-upload"
          className="p-button-help"
          disabled={(!products || products.length == 0 ) ? true : false}
          onClick={exportCSV}
        />
      </div>
    );
  };

  // table headre
  const header = (
    <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
      <h4 className="m-0">Upcoming Schedules</h4>
      <IconField iconPosition="left">
        <InputIcon className="pi pi-search" />
        <InputText
          type="search"
          onInput={(e) => setGlobalFilter(e.target.value)}
          placeholder="Search..."
        />
      </IconField>
    </div>
  );

  // view, edit and delete button
  const actionBodyTemplate = (rowData) => {
    return (
      <React.Fragment>
        <div className="flex">
            <Button
              icon="pi pi-eye"
              outlined
              severity="success"
              className="me-2 rounded-circle a-btn"
              style={{ fontSize: '15px' }}
              onClick={() => viewProduct(rowData)}
              data-tooltip-id="abt1"
              data-tooltip-content="View"
              data-tooltip-offset={10}
            />
            <Tooltip id="abt1" className="tooltip" />
          { role !== "Member" && (<>
            <a 
              href={`https://bookingform.bharatmakers.com?id=${rowData.id}`}
              target="_blank"
            >
              <Button
                icon="pi pi-pencil"
                outlined
                className="me-2 rounded-circle"
                style={{ fontSize: '15px' }}
                data-tooltip-id="abt1"
                data-tooltip-content="Edit"
                data-tooltip-offset={10}  
              />
            </a>
            <Tooltip id="abt1" className="tooltip" />
            <Button
              icon="pi pi-trash"
              outlined
              severity="danger"
              className="rounded-circle a-btn"
              style={{ fontSize: '15px' }}
              onClick={() => confirmDeleteProduct(rowData)}
              data-tooltip-id="abt1"
              data-tooltip-content="Delete"
              data-tooltip-offset={10}
            />
            <Tooltip id="abt1" className="tooltip" />
          </>)}
        </div>
      </React.Fragment>
    );
  };

  // delete one
  const deleteProduct = async () => {
    setloading(true);
    const response = await deleteSchedule(product.id);    
    if (response.status) {
        let _products = products.filter((val) => val.id !== product.id);
        setProducts(_products);
        setDeleteProductDialog(false);
        setProduct({});    
        toast.success(response.message, {
            position: "top-right",
            autoClose: 3000,
        });
    } else {
        toast.warning(response.message, {
            position: "top-right",
            autoClose: 3000,
        });
    }
    setloading(false);
  };
  const deleteProductDialogFooter = (
    <React.Fragment>
      <Button
        label="No"
        icon="pi pi-times"
        className="me-2"
        outlined
        onClick={() => setDeleteProductDialog(false)}
      />
      <Button
        label="Yes"
        icon="pi pi-check"
        severity="danger"
        disabled={loading}
        onClick={deleteProduct}
      />
    </React.Fragment>
  );

  // delete many
  const deleteSelectedProducts = () => {
    setloading(true);
    let _products1 =  [...products];
    const deletePromises = selectedProducts.map(async (item)=>{
        const response = await deleteSchedule(item.id);
        if (response.status) {
            let _products2 = _products1.filter((val) => val.id !== item.id);
            _products1 = [..._products2];
        } else {
            toast.warning(response.message, {
                position: "top-right",
                autoClose: 3000,
            });    
        }
    });
    Promise.all(deletePromises).then (()=>{
        setProducts(_products1);
        setDeleteProductsDialog(false);
        setSelectedProducts(null);
        toast.success("Teams Deleted", { position: "top-right", autoClose: 3000 });
    });
    setloading(false);
  };
  const deleteProductsDialogFooter = (
    <React.Fragment>
      <Button
        label="No"
        icon="pi pi-times"
        className="me-2"
        outlined
        onClick={() => setDeleteProductsDialog(false)}
      />
      <Button
        label="Yes"
        icon="pi pi-check"
        severity="danger"
        disabled={loading}
        onClick={deleteSelectedProducts}
      />
    </React.Fragment>
  );

  // Slot Timing
  const slotTiming = (rowData) => rowData.start_time + " - " + rowData.end_time;

  // Function to get S.No
  const getSerialNo = (rowData, index) => index.rowIndex + 1;

  return (
    <>
      <ToastContainer />
      <div className="card">
        <Toolbar
          className="mb-4"
          start={rightToolbarTemplate}
          end={role !== "Member" && (leftToolbarTemplate)}
        ></Toolbar>

        {/* table */}
        <DataTable
          ref={dt}
          value={products}
          paginator
          rows={10}
          className="datatable"
          rowsPerPageOptions={[5, 10, 15]}
          globalFilter={globalFilter}
          header={header}
          selection={selectedProducts}
          onSelectionChange={(e) => setSelectedProducts(e.value)}
          selectionMode={role !== "Member" && "checkbox"}
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products"
        >
          {role !== "Member" && (
            <Column selectionMode="multiple" exportable={false} style={{ width: "30px" }} />
          )}
          <Column header="S.No" body={getSerialNo} style={{ width: "30px" }} />
          <Column field="event_name" sortable header="Event Name" />
          {role !== "Member" && (
            <Column field="showroom_name" sortable header="Showroom Name" />
          )}
          {role !== "Member" && (
            <Column field="team_name" sortable header="Team Name" />
          )}
          <Column field="date" sortable header="Date" />
          <Column sortable header="Slot Timing" body={slotTiming} />
          <Column field="designer_name" sortable header="Designer Name" />
          <Column field="client_name" sortable header="Client Name" />
          <Column
            header="Action"
            body={actionBodyTemplate}
            exportable={false}
            style={{ width: "50px" }}
          />
        </DataTable>
      </div>

      {/* Show product dialog */}
      <Dialog
        visible={productDialog}
        style={{ width: "32rem" }}
        breakpoints={{ "960px": "75vw", "641px": "90vw" }}
        modal
        className="p-fluid"
        header="Booking Details"
        footer={productDialogFooter}
        onHide={hideDialog}
      >
        <hr />
        <div>
          <p>Event Name : <b>{product.event_name}</b></p>
          <p>Showroom Name : <b>{product.showroom_name}</b></p>
          <p>Team Name : <b>{product.team_name}</b></p>
          <p>Date : <b>{product.date}</b></p>
          <p>Slot Timing : <b>{product.start_time} - {product.end_time}</b></p>
          <p>Designer Name : <b>{product.designer_name}</b></p>
          <p>Client Name : <b>{product.client_name}</b></p>
          <p>Client Id : <b>{product.client_id}</b></p>
          <p>Address : <b>{product.address}</b></p>
          <p>Location : <b><a href={product.location} target="_blank">{product.location}</a></b></p>
        </div>
        <hr />
      </Dialog>

      {/* delete single product dialog */}
      <Dialog
        visible={deleteProductDialog}
        style={{ width: "32rem" }}
        breakpoints={{ "960px": "75vw", "641px": "90vw" }}
        header="Confirm"
        modal
        footer={deleteProductDialogFooter}
        onHide={() => setDeleteProductDialog(false)}
      >
        <div>
          <i
            className="pi pi-exclamation-triangle me-3"
            style={{ fontSize: "2rem" }}
          />
          {product && (
            <span>
              Are you sure you want to delete <b>{product.client_name}</b> ?
            </span>
          )}
        </div>
      </Dialog>

      {/* delete many products dialog */}
      <Dialog
        visible={deleteProductsDialog}
        style={{ width: "32rem" }}
        breakpoints={{ "960px": "75vw", "641px": "90vw" }}
        header="Confirm"
        modal
        footer={deleteProductsDialogFooter}
        onHide={() => setDeleteProductsDialog(false)}
      >
        <div>
          <i
            className="pi pi-exclamation-triangle me-3"
            style={{ fontSize: "2rem" }}
          />
          {product && (
            <span>Are you sure you want to delete the selected Items ?</span>
          )}
        </div>
      </Dialog>
    </>
  );
};

export default UpcomingList;