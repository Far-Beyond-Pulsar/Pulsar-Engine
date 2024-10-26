///////////////////////////////////////////////////////////////////////////////
// Pulsar Engine Main File                                                   //
//                                                                           //
//   This file serves as the entrypoint for all things Pulsar Engine it is   //
//   responsible for starting the engine's backend and frontend code as well //
//   as fetching important important data from the configs.                  //
//                                                                           //
///////////////////////////////////////////////////////////////////////////////

mod ui;

use lazy_static::*;
use std::{sync::RwLock};

pub struct Node {
    parent: Option<Box<Node>>,
    children: Box<Vec<Node>>
}

impl Node {
    fn get_parent(&self) {}
    fn add_child(&mut self) {}
    fn remove_child(&mut self) {}
    
}

struct SceneTree {
    root: Node
}

impl SceneTree {
    fn get_root(&self) {}
    fn find_child(&self) {}
    fn find_children(&self) {}
}

lazy_static! {
    static ref SCENE_TREE: RwLock<SceneTree> = {
        SceneTree {
            root: Node {children:Box::new(vec![]), parent: None }
        }.into()
    };
}

fn main() {
    let test_tree = SCENE_TREE.read().unwrap();
    test_tree.get_root();
    test_tree.find_child();


    
    ui::initUI();
}