var map;

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 51.4387992,
            lng: 0.3646522
        },
        zoom: 8
    });
}