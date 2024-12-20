
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import { Tooltip } from 'react-tooltip';
import { getUpcomingSchedule, deleteSchedule, editScheduleDetails } from "../../services/api/api";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toolbar } from "primereact/toolbar";
import { Button } from "primereact/button";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { InputText } from "primereact/inputtext";
import { classNames } from "primereact/utils";
import { Dialog } from "primereact/dialog";

const UpcomingList = () => {
  let emptyProduct = {
    id: null,
    designer_name : "",
    client_name : "",
    client_id : "",
    address : "",
    location : "",
  };
  const role = useSelector((state) => state.user.userDetails.UserRole);
  const team_id = useSelector((state) => state.user.userDetails.UserTeamId);
  const [products, setProducts] = useState();
  const [globalFilter, setGlobalFilter] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState(null);
  const [product, setProduct] = useState({emptyProduct});
  const [viewDialog, setViewDialog] = useState(false);
  const [productDialog, setProductDialog] = useState(false);
  const [deleteProductDialog, setDeleteProductDialog] = useState(false);
  const [deleteProductsDialog, setDeleteProductsDialog] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setloading] = useState(false);
  const [validurl, setValidurl] = useState(false);
  const dt = useRef(null);


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

  //open edit popup
  const editProduct = (product) => {
    setProduct({ ...product });
    setProductDialog(true);
  };

  // hide popup
  const hideDialog = () => {
    setViewDialog(false);
    setProductDialog(false);
  };

  //open view popup
  const viewProduct = (product) => {
    setProduct({ ...product });
    setViewDialog(true);
  };

  // input
  const onInputChange = (e, name) => {
    if (name === "location") setValidurl(false);
    const val = (e.target && e.target.value) || "";
    let _product = { ...product };
    _product[`${name}`] = val.trimStart();
    setProduct(_product);
  };
  
  // trim white space in object
  const trimObjectValues = (obj) => {
    const trimmedObject = {};
    for (const key in obj) {
      (typeof obj[key] === "string") ? trimmedObject[key] = obj[key].trim() : trimmedObject[key] = obj[key];
    }
    return trimmedObject;
  };

  // edit Item
  const editItem = async () => {
    setSubmitted(true);
    let _product = trimObjectValues(product);
    // console.log(_product);
    
    if (!_product.id || !_product.designer_name || !_product.client_name || !_product.client_id || !_product.address || !_product.location) {
      return;
    }
    if (_product.location) {
      try {
        new URL(_product.location);
        setValidurl(false);
      } catch (e) {
        setValidurl(true);
        return;
      }
    }

    // edit api
    if (_product.id) {
      let _products = [...products];
      setloading(true);
      const index = products.findIndex((item) => item.id === _product.id);
      const response = await editScheduleDetails(_product);
      if (response.status) {
          _products[index] = _product;
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
      setSubmitted(false);
      setloading(false);
      setProducts(_products);
      setProductDialog(false);
      setProduct(emptyProduct);
    }
  };
  
  // delete one item
  const confirmDeleteProduct = (product) => {
    setProduct(product);
    setDeleteProductDialog(true);
  };

  // Save and cancel button
  const productDialogFooter = (
    <React.Fragment>
      <Button
        label="Close"
        icon="pi pi-times"
        className="me-2"
        outlined
        onClick={hideDialog}
      />
      <Button 
        label="Save" 
        icon="pi pi-check" 
        disabled={loading}
        onClick={editItem} 
      />
    </React.Fragment>
  );

  // Close button
  const viewDialogFooter = (
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

  // view, re-schedule, edit and delete button
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
              data-tooltip-id="action1"
              data-tooltip-content="View"
              data-tooltip-offset={10}
            />
            <Tooltip id="action1" className="tooltip" />
          { role !== "Member" && (<>
            <a 
              href={`https://bookingform.bharatmakers.com?id=${rowData.id}`}
              target="_blank"
            >
              <Button
                icon="pi pi-sync"
                outlined
                className="me-2 rounded-circle"
                style={{ fontSize: '15px' }}
                data-tooltip-id="action2"
                data-tooltip-content="Re-schedule"
                data-tooltip-offset={10}  
              />
            </a>
            <Tooltip id="action2" className="tooltip" />
            <Button
                icon="pi pi-pencil"
                outlined
                className="me-2 rounded-circle"
                style={{ fontSize: '15px' }}
                onClick={() => editProduct(rowData)}
                data-tooltip-id="action3"
                data-tooltip-content="Edit"
                data-tooltip-offset={10}  
              />
            <Tooltip id="action3" className="tooltip" />
            <Button
              icon="pi pi-trash"
              outlined
              severity="danger"
              className="rounded-circle a-btn"
              style={{ fontSize: '15px' }}
              onClick={() => confirmDeleteProduct(rowData)}
              data-tooltip-id="action4"
              data-tooltip-content="Delete"
              data-tooltip-offset={10}
            />
            <Tooltip id="action4" className="tooltip" />
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

      {/* View product dialog */}
      <Dialog
        visible={viewDialog}
        style={{ width: "32rem" }}
        breakpoints={{ "960px": "75vw", "641px": "90vw" }}
        modal
        className="p-fluid"
        header="Booking Details"
        footer={viewDialogFooter}
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

      {/* edit product dialog */}
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
        <div className="field mb-3">
          <label htmlFor="designer_name" className="font-bold">Designer Name *</label>
          <InputText
            id="designer_name"
            value={product.designer_name}
            onChange={(e) => onInputChange(e, "designer_name")}
            required
            className={classNames({
              "p-invalid": submitted && !product.designer_name,
            })}
          />
          {submitted && !product.designer_name.trim() && (
            <small className="p-error">Designer Name is required.</small>
          )}
        </div>
        <div className="field mb-3">
          <label htmlFor="client_name" className="font-bold">Client Name *</label>
          <InputText
            id="client_name"
            value={product.client_name}
            onChange={(e) => onInputChange(e, "client_name")}
            required
            className={classNames({
              "p-invalid": submitted && !product.client_name,
            })}
          />
          {submitted && !product.client_name.trim() && (
            <small className="p-error">Client Name  is required.</small>
          )}
        </div>
        <div className="field mb-3">
          <label htmlFor="client_id" className="font-bold">Client Id *</label>
          <InputText
            id="client_id"
            value={product.client_id}
            onChange={(e) => onInputChange(e, "client_id")}
            required
            className={classNames({
              "p-invalid": submitted && !product.client_id,
            })}
          />
          {submitted && !product.client_id.trim() && (
            <small className="p-error">Client Id is required.</small>
          )}
        </div>
        <div className="field mb-3">
          <label htmlFor="address" className="font-bold">Address *</label>
          <InputText
            id="address"
            value={product.address}
            onChange={(e) => onInputChange(e, "address")}
            required
            className={classNames({
              "p-invalid": submitted && !product.address,
            })}
          />
          {submitted && !product.address.trim() && (
            <small className="p-error">Address is required.</small>
          )}
        </div>
        <div className="field mb-3">
          <label htmlFor="location" className="font-bold">Location *</label>
          <InputText
            id="location"
            type="url"
            value={product.location}
            onChange={(e) => onInputChange(e, "location")}
            required
            className={classNames({
              "p-invalid": submitted && !product.location,
            })}
          />
          {submitted && !product.location.trim() && (
            <small className="p-error">Location is required.</small>
          )}
          {submitted && product.location && validurl && (
            <small className="p-error">Invalid URL for Google Location.</small>
          )}
        </div>
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