import { getCustomRepository, getRepository } from "typeorm";
import { Response, Request } from "express";

import Cart from "../entities/Cart";
import CreateCartService from "../services/Cart/CreateCartService";
import AddProductOnCartService from "../services/CartProducts/AddProductOnCartService";
import AppError from "../errors/AppError";
import UserRepository from "../repositories/UserRepository";
import RemoveProductOnCartService from "../services/CartProducts/RemoveProductOnCart";

export const create = async (request: Request, response: Response) => {
    const { productId } = request.body;

    const cartReposity = getRepository(Cart);

    const addProductService = new AddProductOnCartService();

    await addProductService.execute({
        userId: request.user.id,
        productId,
    });

    const cart = await cartReposity.findOne({
        userId: request.user.id
    });
  
    return response.status(200).json(cart);
};

export const list = async (request: Request, response: Response) => {
    const cartRepository = getRepository(Cart);
  
    const carts = await cartRepository.find();
  
    return response.json(carts);
};

export const retrieve = async (request: Request, response: Response) => {
    const { id } = request.params;

    const cartRepository = getRepository(Cart);
    const userRepository = getCustomRepository(UserRepository);

    const user = await userRepository.findOne({
        where: {
            id: request.user.id,
        }
    });

    if (!user || !user.isAdm && id !== request.user.id) {
        throw new AppError("Unauthorized", 401);
    }

    const cart = await cartRepository.findOne({
        where: {
            userId: id,
        }
    })

    if (!cart) {
        throw new AppError("Cart not found.", 404)
    };   

    return response.json(cart);
};

export const destroy = async (request: Request, response: Response) => {
    const { product_id } = request.params;

    const removeProductService = new RemoveProductOnCartService();

    await removeProductService.execute({
        userId: request.user.id,
        productId: product_id,
    });

    return response.status(204).json();
}