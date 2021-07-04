/*
SPDX-License-Identifier: Apache-2.0
*/

package main

import (
	"encoding/json"
	"fmt"
	"strconv"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)
// utils "github.com/cd1/utils-golang"

// SmartContract provides functions for managing a car
type SmartContract struct {
	contractapi.Contract
}

// Car describes basic details of what makes up a car
type Car struct {
	Make   string `json:"make"`
	Model  string `json:"model"`
	Colour string `json:"colour"`
	Owner  string `json:"owner"`
}

// =========================================================================================
// SSE WEB MODULE DEPLOY STARTS HERE: SCHEMA
// =========================================================================================

type User struct {
	Id      string `json:"id"`
	Doctype string `json:"doctype"`
	Name    string `json:"name"`
	Email   string `json:"email"`
}

type File struct {
	Id      string `json:"id"`
	Doctype string `json:"doctype"`
	FilePath string `json:"filePath"`
	Keyword string `json:"keyword"`
	NumberOfKeyword int `json:"numberOfKeyword"`
}

//here doctype will be "sentRequest"
type RequestFile struct {
	Id      	string `json:"id"`
	Doctype 	string `json:"doctype"`
	FileId 		string `json:"fileid"`
	OwnerId   	string `json:"ownerid"`
	RequesterId string `json:"requesterid"`
	ResponseType string `json:"responseType"`
}

type QueryResultFile struct {
	Key    string `json:"Key"`
	Record *File
}

// =========================================================================================
// SSE WEB MODULE DEPLOY ENDS HERE: SCHEMA
// =========================================================================================

// QueryResult structure used for handling result of query
type QueryResult struct {
	Key    string `json:"Key"`
	Record *Car
}

// InitLedger adds a base set of cars to the ledger
func (s *SmartContract) InitLedger(ctx contractapi.TransactionContextInterface) error {
	cars := []Car{
		Car{Make: "Toyota", Model: "Prius", Colour: "blue", Owner: "Tomoko"},
		Car{Make: "Ford", Model: "Mustang", Colour: "red", Owner: "Brad"},
		Car{Make: "Hyundai", Model: "Tucson", Colour: "green", Owner: "Jin Soo"},
		Car{Make: "Volkswagen", Model: "Passat", Colour: "yellow", Owner: "Max"},
		Car{Make: "Tesla", Model: "S", Colour: "black", Owner: "Adriana"},
		Car{Make: "Peugeot", Model: "205", Colour: "purple", Owner: "Michel"},
		Car{Make: "Chery", Model: "S22L", Colour: "white", Owner: "Aarav"},
		Car{Make: "Fiat", Model: "Punto", Colour: "violet", Owner: "Pari"},
		Car{Make: "Tata", Model: "Nano", Colour: "indigo", Owner: "Valeria"},
		Car{Make: "Holden", Model: "Barina", Colour: "brown", Owner: "Shotaro"},
	}

	for i, car := range cars {
		carAsBytes, _ := json.Marshal(car)
		err := ctx.GetStub().PutState("CAR"+strconv.Itoa(i), carAsBytes)

		if err != nil {
			return fmt.Errorf("Failed to put to world state. %s", err.Error())
		}
	}

	return nil
}








































// =========================================================================================
// SSE WEB MODULE DEPLOY STARTS HERE: FUNCTION
// =========================================================================================

func (s *SmartContract) Register(ctx contractapi.TransactionContextInterface, id string, email string, name string) error {
	//id := utils.RandomString()

	user := User{
		Id:      id,
		Doctype: "User",
		Name:    name,
		Email:   email,
	}

	fmt.Println("User created in register function:", user)

	userAsBytes, _ := json.Marshal(user)

	fmt.Println("User created in register function:", userAsBytes)
	return ctx.GetStub().PutState(id, userAsBytes)
}

func (s *SmartContract) QueryUserById(ctx contractapi.TransactionContextInterface, userId string) (*User, error) {
	userAsBytes, err := ctx.GetStub().GetState(userId)

	if err != nil {
		return nil, fmt.Errorf("Failed to read from world state. %s", err.Error())
	}

	if userAsBytes == nil {
		return nil, fmt.Errorf("%s does not exist", userId)
	}

	user := new(User)
	_ = json.Unmarshal(userAsBytes, user)

	return user, nil
}

func (s *SmartContract) FileUpload(ctx contractapi.TransactionContextInterface, id string, filePath, string, keyword string, numberOfKeyword int) error {
	//id := utils.RandomString()

	file := File{
		Id:      id,
		Doctype: "File",
		FilePath: filePath,
		Keyword: keyword,
		NumberOfKeyword: numberOfKeyword,
	}

	fmt.Println("File has been uploaded", file)

	fileAsBytes, _ := json.Marshal(file)

	fmt.Println("File uploaded successfully", fileAsBytes)
	return ctx.GetStub().PutState(id, fileAsBytes)
}

func (s *SmartContract) QueryFileById(ctx contractapi.TransactionContextInterface, fileId string) (*File, error) {
	fileAsBytes, err := ctx.GetStub().GetState(fileId)

	if err != nil {
		return nil, fmt.Errorf("Failed to read from world state. %s", err.Error())
	}

	if fileAsBytes == nil {
		return nil, fmt.Errorf("%s does not exist", fileId)
	}

	file := new(File)
	_ = json.Unmarshal(fileAsBytes, file)

	return file, nil
}



func (s *SmartContract) FileRequestNotification(ctx contractapi.TransactionContextInterface, fileId string, ownerId string, requesterId string, responseType string) error {
	id := fileId + ownerId + requesterId
	//ownerid, _ := QueryUserByName(ctx, ownerName)		//if shows error try s.QueryUserByName(ctx, ownerName) [also for follwing two lines]
	//requesterid, _ := QueryUserByName(ctx, requesterName)
	//fileid, _ := QueryFileByName(ctx, fileName)

	requestfile := RequestFile{
		Id:          id,
		Doctype: 	 "Request",
		FileId:		 fileId,
		OwnerId:   	 ownerId,
		RequesterId: requesterId,
		ResponseType: responseType,
	}

	fmt.Println("Transaction regarding file requsest occur", requestfile)

	requestfileAsBytes, _ := json.Marshal(requestfile)

	fmt.Println("Transaction created for file request sent", requestfileAsBytes)
	return ctx.GetStub().PutState(id, requestfileAsBytes)
}

func (s *SmartContract) FileRequestAccept(ctx contractapi.TransactionContextInterface, fileId string, ownerId string, requesterId string, responseType string) error {
	//id := utils.RandomString()
	id := fileId + ownerId + requesterId

	requestfile := RequestFile{
		Id:          id,
		Doctype: 	 "acceptRequest",
		FileId:		 fileId,
		OwnerId:   	 ownerId,
		RequesterId: requesterId,
		ResponseType: responseType,
	}

	fmt.Println("Transaction regarding file requsest occur", requestfile)

	requestfileAsBytes, _ := json.Marshal(requestfile)

	fmt.Println("Transaction created for file request sent", requestfileAsBytes)
	return ctx.GetStub().PutState(id, requestfileAsBytes)

}

// =========================================================================================
// SSE WEB MODULE DEPLOY ENDS HERE: FUNCTION
// =========================================================================================










































// CreateCar adds a new car to the world state with given details
func (s *SmartContract) CreateCar(ctx contractapi.TransactionContextInterface, carNumber string, make string, model string, colour string, owner string) error {
	car := Car{
		Make:   make,
		Model:  model,
		Colour: colour,
		Owner:  owner,
	}

	carAsBytes, _ := json.Marshal(car)

	return ctx.GetStub().PutState(carNumber, carAsBytes)
}

// QueryCar returns the car stored in the world state with given id
func (s *SmartContract) QueryCar(ctx contractapi.TransactionContextInterface, carNumber string) (*Car, error) {
	carAsBytes, err := ctx.GetStub().GetState(carNumber)

	if err != nil {
		return nil, fmt.Errorf("Failed to read from world state. %s", err.Error())
	}

	if carAsBytes == nil {
		return nil, fmt.Errorf("%s does not exist", carNumber)
	}

	car := new(Car)
	_ = json.Unmarshal(carAsBytes, car)

	return car, nil
}

// QueryAllCars returns all cars found in world state
func (s *SmartContract) QueryAllCars(ctx contractapi.TransactionContextInterface) ([]QueryResult, error) {
	startKey := ""
	endKey := ""

	resultsIterator, err := ctx.GetStub().GetStateByRange(startKey, endKey)

	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()

	results := []QueryResult{}

	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()

		if err != nil {
			return nil, err
		}

		car := new(Car)
		_ = json.Unmarshal(queryResponse.Value, car)

		queryResult := QueryResult{Key: queryResponse.Key, Record: car}
		results = append(results, queryResult)
	}

	return results, nil
}

// ChangeCarOwner updates the owner field of car with given id in world state
func (s *SmartContract) ChangeCarOwner(ctx contractapi.TransactionContextInterface, carNumber string, newOwner string) error {
	car, err := s.QueryCar(ctx, carNumber)

	if err != nil {
		return err
	}

	car.Owner = newOwner

	carAsBytes, _ := json.Marshal(car)

	return ctx.GetStub().PutState(carNumber, carAsBytes)
}

func main() {

	chaincode, err := contractapi.NewChaincode(new(SmartContract))

	if err != nil {
		fmt.Printf("Error create fabcar chaincode: %s", err.Error())
		return
	}

	if err := chaincode.Start(); err != nil {
		fmt.Printf("Error starting fabcar chaincode: %s", err.Error())
	}
}
