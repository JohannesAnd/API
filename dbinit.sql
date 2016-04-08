DROP DATABASE IF EXISTS cars;
CREATE DATABASE IF NOT EXISTS cars;
USE cars;

DROP USER IF EXISTS testUser;
CREATE USER 'testUser'@'%' IDENTIFIED BY 'abcABC12345678#';
GRANT ALL PRIVILEGES ON cars.* TO 'testUser'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;

CREATE TABLE IF NOT EXISTS Users(
    id INT NOT NULL,
	is_admin BOOL,
	name VARCHAR(40) NOT NULL,
	password VARCHAR(50) NOT NULL,
	PRIMARY KEY(id)
);

CREATE TABLE IF NOT EXISTS Organizations(
    id INT AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    PRIMARY KEY(id)
);

CREATE TABLE IF NOT EXISTS Cars(
    registration VARCHAR(10) NOT NULL,
    make VARCHAR(20),
    type VARCHAR(30),
    prodYear INT,
    organization_id INT NOT NULL,
    FOREIGN KEY(organization_id) REFERENCES Organizations(id),
    PRIMARY KEY(registration)
);

CREATE TABLE IF NOT EXISTS OrgMembers(
    user_id INT NOT NULL,
    org_id INT NOT NULL,
    role VARCHAR(10) NOT NULL,
    FOREIGN KEY(user_id) REFERENCES Users(id),
    FOREIGN KEY(org_id) REFERENCES Organizations(id),
    PRIMARY KEY(user_id, org_id)
);


CREATE TABLE IF NOT EXISTS Trips(
    id VARCHAR(100) NOT NULL,
    car_id VARCHAR(10) NOT NULL,
    user_id INT,
    start_time DATETIME(3) NOT NULL,
    PRIMARY KEY(id),
    FOREIGN KEY(user_id) REFERENCES Users(id),
    FOREIGN KEY(car_id) REFERENCES Cars(registration)
);

CREATE TABLE IF NOT EXISTS TripVertices(
    trip_id VARCHAR(100) NOT NULL,
    longitude DOUBLE,
    latitude DOUBLE,
    speed DOUBLE,
    altitude DOUBLE,
    coolant_temp DOUBLE,
    engine_load DOUBLE,
    fuel_pressure DOUBLE,
    intake_air_temp DOUBLE,
    rpm INT,
    error_msg VARCHAR(1000),
    registration_time DATETIME(3) NOT NULL,
    FOREIGN KEY(trip_id) REFERENCES Trips(id),
    PRIMARY KEY(trip_id, registration_time)
);

INSERT INTO Users VALUES(346372, true, "Admin", "1234");
INSERT INTO Users VALUES(374759, false, "Gunnar", "1234");
INSERT INTO Organizations VALUES(null, "MinOrg");
INSERT INTO Cars VALUES("EN12325", "Lada", "Shitwagon", 1839, 1);
INSERT INTO Cars VALUES("EN53325", "Lada", "Snailmobile", 1019, 1);
INSERT INTO OrgMembers VALUES(374759, 1, "Member");
