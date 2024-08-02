L.Control.MeasureDistance = L.Control.extend({
    options: {
        p1: [48.90675, 2.24645],
        p2: { lat: 48.9072, lng: 2.2403 },
        img1: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAACXBIWXMAAA7EAAAOxAGVKw4bAAABfklEQVR4nO3Qy3UaQRRF0d3OhrEdAlkQjCAYsiAEe0w6nshaksWnP1V1aag76x7UemcPCm+7O//E79Lvvu/X6bj5U/LBHyUfW+M6QPqA9DpA+oD0OkD6gPQ6QPqA9DpA+oD0OkD6gPQ6QPqA9DpA+oD0OkD6gPQ6QPqA9DpA+oD0OkD6gPQ6QPqA9DpA+oD0OkD6gPSG7e68x1v6kNAOA7wowuF03OyHf18vhnA4HTd7GD7/fRGEj3j+A+DpEb7EcwGAp0X4Fs8VAJ4O4WI8NwB4GoSr8dwBYPUIN+MZAcBqEe7GMxKA1SGMimcCAKtBGB3PRAAeHmFSPDMAeFiEyfHMBODhEGbFswCAh0GYHc9CAOIIi+IpAEAMYXE8hQBojlAknoIANEMoFk9hAKojFI2nAgDVEIrHUwmA4ghV4qkIQDGEavFUBmAxQtV4GgAwG6F6PI0AmIzQJJ6GAIxGaBZPYwDuIjSNJwDAVYTm8YQA+IYQiY9vuzvv3yFi+wt3waJBMz65LQAAAABJRU5ErkJggg==",
        img2: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAACXBIWXMAAA7EAAAOxAGVKw4bAAABRElEQVR4nO2ZsY0DMQwEiS/jo+vhGrlulLIuVePIKUvwR2sYsP227yivJHIApcLOAIok4s8qIpdGZ/Ue++N94WhkAPYANhmAPYBNBmAPYJMB2APYZAD2ADYZgD2ATQZgD2CTAdgD2GQA9gA2GYA9gE0GYA9gkwHYA9i4B9i27df7zm/c7YKZLbXWszT6Gqu1ns1s+aLSLvJvcCQyAHtAD6i0e7O9H40c4SofMcKdfKQIT+UjRHgpP3OEt+VnjPCx/EwRdsvPEOGw/MgR3ORHjOAuD7QDOZo8ULIgVR5oY5Gu5YEeHDy0PNAXw6aWByqB5YFKYHmgElgeqASWBypR5c1sMbNTKcVdvpRyMbNT9z9DLSIMIw88IwwnDzwiDCsPjkQYXh7siTCNPPgkwnTy4J0I08qD/yJMLw8eRQgjD24jsOX/ACzrCBpmohyQAAAAAElFTkSuQmCC",
        circle: false,
    },

    onAdd: function (map) {
        this._map = map;
        this._container = L.DomUtil.create("div", "leaflet-control-measure");
        this._createMarkers();
        return this._container;
    },

    _createMarkers: function () {
        let ico1 = L.icon({
            iconUrl: this.options.img1,
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32],
        });

        let ico2 = L.icon({
            iconUrl: this.options.img2,
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32],
        });

        this._m1 = L.marker(this.options.p1, { draggable: true, icon: ico1 }).addTo(this._map);
        this._m2 = L.marker(this.options.p2, { draggable: true, icon: ico2 }).addTo(this._map);
        this._m1.on("drag", this._update, this);
        this._m2.on("drag", this._update, this);

        this._m1.on("dragend", this._zoom, this);
        this._m2.on("dragend", this._zoom, this);

        this._update();
    },

    _update: function () {
        let p1 = this._m1.getLatLng();
        let p2 = this._m2.getLatLng();

        if (this._line) {
            this._map.removeLayer(this._line);
        }
        this._line = L.polyline([p1, p2], { color: "red" }).addTo(this._map);

        if (this._m3) {
            this._map.removeLayer(this._m3);
        } else {
            this._zoom();
        }
    },

    _zoom: function () {
        let p1 = this._m1.getLatLng();
        let p2 = this._m2.getLatLng();
        let dist_km = p1.distanceTo(p2) / 1000;

        let p3 = L.latLng((p1.lat + p2.lat) / 2, (p1.lng + p2.lng) / 2);
        if (this._m3) {
            this._map.removeLayer(this._m3);
        }
        this._m3 = L.circle(p3, { radius: 1, color: "red" })
            .addTo(this._map)
            .bindPopup(
                `
                <img src="${this.options.img1}" width=16 />
                ${p1.lat.toFixed(5)}, ${p1.lng.toFixed(5)}<br>
                <img src="${this.options.img2}" width=16 />
                ${p2.lat.toFixed(5)}, ${p2.lng.toFixed(5)}<br>
                <hr>
                Middle: ${p3.lat.toFixed(5)}, ${p3.lng.toFixed(5)}<br>
                <hr>
                Distance: ${dist_km.toFixed(2)} km<br>
                `
            );
        this._m3.openPopup();

        if (this.options.circle) {
            if (this._circle) {
                this._map.removeLayer(this._circle);
            }
            this._circle = L.circle(p1, { radius: dist_km * 1000 }).addTo(this._map);
            this._map.fitBounds(this._circle.getBounds());
        } else {
            let bounds = L.latLngBounds(this._m1.getLatLng(), this._m2.getLatLng());
            this._map.fitBounds(bounds);
        }
    },
});

L.control.measureDistance = function (options) {
    return new L.Control.MeasureDistance(options);
};
